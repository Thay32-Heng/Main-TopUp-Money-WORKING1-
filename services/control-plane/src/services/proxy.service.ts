import fs from 'fs';
import path from 'path';

export class ProxyService {
  private dynamicConfigDir: string;

  constructor() {
    this.dynamicConfigDir =
      process.env.PROXY_DYNAMIC_DIR ||
      path.resolve(process.cwd(), '../../deploy/traefik/dynamic');
  }

  private ensureDir() {
    if (!fs.existsSync(this.dynamicConfigDir)) {
      fs.mkdirSync(this.dynamicConfigDir, { recursive: true });
    }
  }

  /**
   * STEP_ROUTING: Register dynamic Traefik file provider routing rule
   */
  async registerTenantRoute(
    slug: string,
    targetUrl: string,
    customDomain?: string
  ): Promise<string> {
    this.ensureDir();

    const fileName = `${slug}.yml`;
    const filePath = path.join(this.dynamicConfigDir, fileName);

    const rootDomain = process.env.ROOT_DOMAIN || 'topupdomain.com';
    let rule = `PathPrefix(\`/${slug}\`) || Host(\`${slug}.${rootDomain}\`)`;
    if (customDomain && customDomain !== `${slug}.${rootDomain}`) {
      rule = `Host(\`${customDomain}\`) || ${rule}`;
    }

    const yamlContent = `http:
  routers:
    site-${slug}:
      rule: "${rule}"
      priority: 1000
      service: "site-${slug}-service"
      entryPoints:
        - "web"
  services:
    site-${slug}-service:
      loadBalancer:
        servers:
          - url: "${targetUrl}"
`;

    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`[Proxy] Registered dynamic routing for "/${slug}" & "${slug}.${rootDomain}" -> ${targetUrl} (file: ${filePath})`);

    return filePath;
  }

  /**
   * Remove routing rule when site is deleted
   */
  async removeTenantRoute(slug: string): Promise<void> {
    const fileName = `${slug}.yml`;
    const filePath = path.join(this.dynamicConfigDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Proxy] Removed dynamic routing rule: ${filePath}`);
    }
    // Also remove legacy name if exists
    const legacyPath = path.join(this.dynamicConfigDir, `tenant-${slug}.yml`);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }
  }
}

export const proxyService = new ProxyService();
