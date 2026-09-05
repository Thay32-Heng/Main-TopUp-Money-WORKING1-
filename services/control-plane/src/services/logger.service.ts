import { prisma } from '@/lib/prisma';
import { LogLevel, ProvisionStatus } from '@prisma/client';

export class LoggerService {
  /**
   * Helper to write a structured log entry into ProvisionLog and update ProvisionJob state
   */
  async writeLog(
    jobId: string,
    step: string,
    message: string,
    level: LogLevel = LogLevel.INFO
  ): Promise<void> {
    try {
      console.log(`[ProvisionJob:${jobId.slice(0, 8)}] [${step}] [${level}] ${message}`);

      await prisma.$transaction([
        prisma.provisionJob.update({
          where: { id: jobId },
          data: {
            currentStep: step,
            status: level === LogLevel.ERROR ? ProvisionStatus.FAILED : ProvisionStatus.PROVISIONING,
          },
        }),
        prisma.provisionLog.create({
          data: {
            jobId,
            step,
            level,
            message,
          },
        }),
      ]);
    } catch (err: any) {
      console.error(`[LoggerService] Failed to record provision log:`, err.message);
    }
  }
}

export const loggerService = new LoggerService();
export const writeLog = (
  jobId: string,
  step: string,
  message: string,
  level: LogLevel = LogLevel.INFO
) => loggerService.writeLog(jobId, step, message, level);
