import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service
 * 
 * Prisma Client를 관리하고 데이터베이스 연결을 처리합니다.
 * - onModuleInit: 애플리케이션 시작 시 데이터베이스 연결
 * - onModuleDestroy: 애플리케이션 종료 시 연결 해제
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });

    // Query 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development' || process.env.DATABASE_LOGGING === 'true') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Error 로깅
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`, e.target);
    });

    // Info 로깅
    this.$on('info' as never, (e: any) => {
      this.logger.log(`Prisma Info: ${e.message}`);
    });

    // Warn 로깅
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });
  }

  /**
   * 모듈 초기화 시 데이터베이스 연결
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected to database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * 모듈 종료 시 데이터베이스 연결 해제
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Prisma disconnected from database');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect from database', error);
    }
  }

  /**
   * 데이터베이스 연결 상태 확인
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Soft Delete 헬퍼 함수
   * deletedAt을 현재 시간으로 설정하여 소프트 삭제 수행
   */
  async softDelete<T extends { id: string }>(
    model: any,
    id: string,
  ): Promise<T> {
    return model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Soft Delete된 레코드 복원
   * deletedAt을 null로 설정하여 복원
   */
  async restore<T extends { id: string }>(
    model: any,
    id: string,
  ): Promise<T> {
    return model.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * 트랜잭션 헬퍼 함수
   * 여러 작업을 하나의 트랜잭션으로 묶어서 실행
   */
  async transaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(callback as any);
  }
}

