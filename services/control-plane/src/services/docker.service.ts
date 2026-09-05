import Docker from 'dockerode';
import net from 'net';
import { prisma } from '@/lib/prisma';

export interface DeployContainerParams {
  slug: string;
  dockerImage: string;
  env: Record<string, string>;
  networkName?: string;
  preferredPort?: number;
}

export interface ContainerDeployResult {
  containerId: string;
  containerName: string;
  hostPort: number;
  internalPort: number;
}

export class DockerService {
  private docker: Docker;

  constructor() {
    const apiVersion = process.env.DOCKER_API_VERSION || '1.44';
    this.docker = new Docker({
      socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
      version: apiVersion.startsWith('v') ? apiVersion : `v${apiVersion}`,
    });
  }

  /**
   * Find an available host port (Database-Backed to prevent Race Conditions)
   */
  async findAvailablePort(startPort: number = 3100, maxPort: number = 3999): Promise<number> {
    const isPortFree = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => resolve(false));
        server.listen(port, '0.0.0.0', () => {
          server.close(() => resolve(true));
        });
      });
    };

    // Use DB to get the highest allocated port to prevent TOCTOU race conditions
    const aggregate = await prisma.site.aggregate({
      _max: { internalPort: true },
    });

    let startingCandidate = Math.max(startPort, (aggregate._max.internalPort || startPort - 1) + 1);

    for (let port = startingCandidate; port <= maxPort; port++) {
      // Still check net server just in case the port is held by another process
      if (await isPortFree(port)) {
        return port;
      }
    }

    // If we exhausted from startingCandidate, loop back to startPort
    for (let port = startPort; port < startingCandidate; port++) {
      if (await isPortFree(port)) {
        return port;
      }
    }

    throw new Error(`No available host port found in range ${startPort}-${maxPort}`);
  }

  /**
   * Ensure Docker bridge network exists
   */
  async ensureNetwork(networkName: string = 'tenant-net'): Promise<void> {
    try {
      const networks = await this.docker.listNetworks();
      const existing = networks.find((n) => n.Name === networkName);
      if (!existing) {
        console.log(`[Docker] Creating network "${networkName}"...`);
        await this.docker.createNetwork({
          Name: networkName,
          Driver: 'bridge',
          CheckDuplicate: true,
        });
        console.log(`[Docker] Network "${networkName}" created.`);
      }
    } catch (err: any) {
      console.warn(`[Docker] Warning checking network "${networkName}":`, err.message);
    }
  }

  /**
   * STEP_DOCKER_DEPLOY: Deploy / run container idempotently
   */
  async deployTenantContainer(params: DeployContainerParams): Promise<ContainerDeployResult> {
    const containerName = `site-${params.slug}`;
    const networkName = params.networkName || 'tenant-net';

    await this.ensureNetwork(networkName);

    const port = params.preferredPort || (await this.findAvailablePort());

    // 1. Check if container already exists
    try {
      const containers = await this.docker.listContainers({ all: true });
      const existing = containers.find(
        (c) => c.Names.includes(`/${containerName}`) || c.Names.includes(containerName)
      );

      if (existing) {
        const container = this.docker.getContainer(existing.Id);
        const info = await container.inspect();

        if (info.State.Running) {
          console.log(`[Docker] Container "${containerName}" is already running (idempotent).`);
          const boundPort =
            parseInt(info.HostConfig.PortBindings?.['3000/tcp']?.[0]?.HostPort || '0', 10) || port;

          return {
            containerId: existing.Id,
            containerName,
            hostPort: boundPort,
            internalPort: 3000,
          };
        }

        console.log(`[Docker] Container "${containerName}" exists but is stopped. Restarting...`);
        await container.start();
        return {
          containerId: existing.Id,
          containerName,
          hostPort: port,
          internalPort: 3000,
        };
      }
    } catch (err: any) {
      console.warn(`[Docker] Warning inspecting existing container:`, err.message);
    }

    // 2. Format environment variables array
    const envArray: string[] = Object.entries(params.env).map(([key, val]) => `${key}=${val}`);

    console.log(`[Docker] Creating container "${containerName}" on port ${port}...`);

    const container = await this.docker.createContainer({
      Image: params.dockerImage,
      name: containerName,
      Env: envArray,
      ExposedPorts: {
        '3000/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: String(port) }],
        },
        NetworkMode: networkName,
        RestartPolicy: {
          Name: 'unless-stopped',
        },
      },
      Labels: {
        'saas.tenant.slug': params.slug,
        'saas.managed-by': 'control-plane',
      },
    });

    await container.start();
    console.log(`[Docker] Container "${containerName}" started successfully (ID: ${container.id.slice(0, 12)}).`);

    return {
      containerId: container.id,
      containerName,
      hostPort: port,
      internalPort: 3000,
    };
  }

  /**
   * Cleanup / remove container on failure
   */
  async cleanupContainer(containerName: string): Promise<void> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const target = containers.find(
        (c) => c.Names.includes(`/${containerName}`) || c.Names.includes(containerName)
      );

      if (target) {
        console.log(`[Docker] Cleaning up container "${containerName}"...`);
        const container = this.docker.getContainer(target.Id);
        try {
          await container.stop({ t: 2 });
        } catch {}
        await container.remove({ force: true });
        console.log(`[Docker] Container "${containerName}" removed.`);
      }
    } catch (err: any) {
      console.warn(`[Docker] Error during container cleanup:`, err.message);
    }
  }
}

export const dockerService = new DockerService();
