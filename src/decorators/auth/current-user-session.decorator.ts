import { UserSession as UserSessionType } from '@/auth/auth.type';
import {
  ContextType,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { type FastifyRequest } from 'fastify';

export type CurrentUserSession = UserSessionType & {
  headers: FastifyRequest['headers'];
};

export const CurrentUserSession = createParamDecorator(
  (data: keyof UserSessionType | 'headers', ctx: ExecutionContext) => {
    const contextType: ContextType & 'graphql' = ctx.getType();

    let request: FastifyRequest & UserSessionType;

    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      request = gqlCtx.getContext()?.req;
    } else {
      request = ctx.switchToHttp().getRequest();
    }

    if (data) {
      return request?.[data as keyof (FastifyRequest & UserSessionType)];
    }

    return {
      session: request?.session,
      user: request?.user,
      headers: request?.headers,
    };
  },
);
