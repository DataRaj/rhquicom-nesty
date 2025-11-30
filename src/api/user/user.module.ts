import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

/**
 * User Module
 *
 * 사용자 관련 기능을 제공하는 모듈입니다.
 * PrismaModule은 Global 모듈이므로 별도로 import할 필요가 없습니다.
 */
@Module({
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
