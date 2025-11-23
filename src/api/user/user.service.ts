import { BetterAuthService } from '@/auth/better-auth.service';
import { CursorPaginationDto } from '@/common/dto/cursor-pagination/cursor-pagination.dto';
import { CursorPaginatedDto } from '@/common/dto/cursor-pagination/paginated.dto';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUserSession } from '@/decorators/auth/current-user-session.decorator';
import { PrismaService } from '@/database/prisma.service';
import { I18nTranslations } from '@/generated/i18n.generated';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  QueryUsersCursorDto,
  QueryUsersOffsetDto,
  UserDto,
} from './dto/user.dto';

/**
 * User Service
 * 
 * 사용자 관련 비즈니스 로직을 처리합니다.
 * Prisma를 사용하여 데이터베이스와 상호작용합니다.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly prisma: PrismaService,
    private readonly betterAuthService: BetterAuthService,
  ) {}

  /**
   * 전체 사용자 조회 (Offset Pagination)
   * 
   * @param dto - 페이지네이션 옵션
   * @returns 페이지네이션된 사용자 목록
   */
  async findAllUsers(
    dto: QueryUsersOffsetDto,
  ): Promise<OffsetPaginatedDto<UserDto>> {
    const { page = 1, limit = 20 } = dto;
    
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    return new OffsetPaginatedDto(
      users as any,
      {
        pageNumber,
        pageSize,
        totalCount,
        hasNext: pageNumber * pageSize < totalCount,
      } as any,
    );
  }

  /**
   * 전체 사용자 조회 (Cursor Pagination)
   * 
   * @param reqDto - 커서 페이지네이션 옵션
   * @returns 커서 페이지네이션된 사용자 목록
   */
  async findAllUsersCursor(
    reqDto: QueryUsersCursorDto,
  ): Promise<CursorPaginatedDto<UserDto>> {
    const { limit = 20, afterCursor, beforeCursor } = reqDto;
    
    // Cursor 기반 조회
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      take: limit + 1,
      ...(afterCursor
        ? { cursor: { id: afterCursor }, skip: 1 }
        : beforeCursor
        ? { cursor: { id: beforeCursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, -1) : users;
    
    const metaDto = new CursorPaginationDto(
      data.length,
      hasMore ? data[data.length - 1]?.id : null,
      data.length > 0 ? data[0]?.id : null,
      reqDto,
    );

    return new CursorPaginatedDto(data as any, metaDto);
  }

  /**
   * 단일 사용자 조회
   * 
   * @param id - 사용자 ID
   * @param options - 조회 옵션
   * @returns 사용자 정보
   * @throws NotFoundException - 사용자를 찾을 수 없는 경우
   */
  async findOneUser(
    id: Uuid | string,
    options?: {
      select?: any;
      include?: any;
    },
  ): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { 
        id: id as string, 
        deletedAt: null 
      },
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
    });
    
    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.notFound'));
    }
    
    return user as any;
  }

  /**
   * 사용자 삭제 (Soft Delete)
   * 
   * @param id - 사용자 ID
   * @returns HTTP 상태 코드
   * @throws NotFoundException - 사용자를 찾을 수 없는 경우
   */
  async deleteUser(id: Uuid | string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id as string },
    });
    
    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.notFound'));
    }
    
    await this.prisma.user.update({
      where: { id: id as string },
      data: { deletedAt: new Date() },
    });
    
    return HttpStatus.OK;
  }

  /**
   * 전체 사용자 조회 (옵션 포함)
   * 
   * @param options - 조회 옵션
   * @returns 사용자 목록
   */
  async getAllUsers(options?: {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { 
        deletedAt: null,
        ...(options?.where ?? {}) 
      },
      ...(options?.select ? { select: options.select } : {}),
      ...(options?.include ? { include: options.include } : {}),
      ...(options?.orderBy ? { orderBy: options.orderBy } : {}),
    });
  }

  /**
   * 사용자 프로필 업데이트
   * 
   * @param userId - 사용자 ID
   * @param dto - 업데이트할 프로필 정보
   * @param options - 헤더 옵션
   * @returns 업데이트된 사용자 정보
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
    options: { headers: CurrentUserSession['headers'] },
  ) {
    let shouldChangeUsername = !(dto.username == null);

    if (shouldChangeUsername) {
      const user = await this.findOneUser(userId, {
        select: { id: true, username: true },
      });
      shouldChangeUsername = user?.username !== dto.username;
    }

    // Better Auth를 통한 사용자 업데이트
    await this.betterAuthService.api.updateUser({
      body: {
        ...(dto.image !== undefined ? { image: dto.image } : {}),
        ...(shouldChangeUsername ? { username: dto.username } : {}),
      },
      headers: options?.headers as any,
    });

    // 나머지 필드 수동 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      },
    });
    
    return await this.findOneUser(userId);
  }
}
