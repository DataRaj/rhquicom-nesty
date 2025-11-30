import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DrizzleHealthIndicator, HealthController } from './health.controller';

/**
 * Health Module
 *
 * 애플리케이션 상태를 확인하는 Health Check 기능을 제공합니다.
 * - Database (Drizzle)
 * - Redis
 * - API Documentation (non-production)
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DrizzleHealthIndicator],
})
export class HealthModule {}
