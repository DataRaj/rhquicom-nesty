import { AuthService } from '@/auth/auth.service';
import { ErrorDto } from '@/common/dto/error.dto';
import { GlobalConfig } from '@/config/config.type';
import { Public } from '@/decorators/public.decorator';
import { DRIZZLE_DB } from '@/drizzle/drizzle.module';
import * as schema from '@/drizzle/schema';
import { SWAGGER_PATH } from '@/tools/swagger/swagger.setup';
import { Serialize } from '@/utils/interceptors/serialize';
import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorResult,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HealthCheckDto } from './dto/health.dto';

/**
 * Drizzle Health Indicator
 *
 * Drizzle 데이터베이스 연결 상태를 확인하는 Health Indicator입니다.
 */
@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  async pingCheck(
    key: string,
    _options?: { timeout?: number },
  ): Promise<HealthIndicatorResult> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return this.getStatus(key, true, { message: 'Drizzle is up' });
    } catch (error) {
      throw new Error(`Drizzle health check failed: ${error.message}`);
    }
  }
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService<GlobalConfig>,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly drizzleHealthIndicator: DrizzleHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HealthCheckDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorDto,
  })
  @Serialize(HealthCheckDto)
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const list = [
      () =>
        this.drizzleHealthIndicator.pingCheck('database', { timeout: 5000 }),
      () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: this.configService.getOrThrow('redis'),
        }),
    ];
    if (
      this.configService.get('app.nodeEnv', { infer: true }) !== 'production'
    ) {
      list.push(() => {
        const url = `${this.configService.getOrThrow('app.url', { infer: true })}${SWAGGER_PATH}`;
        return this.http.pingCheck('api-docs', url, {
          headers: this.authService.createBasicAuthHeaders(),
        });
      });
    }
    return this.health.check(list);
  }
}
