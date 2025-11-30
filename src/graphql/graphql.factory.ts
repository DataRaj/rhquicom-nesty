import { ApiModule } from '@/api/api.module';
import { GlobalConfig } from '@/config/config.type';
import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';

function useGraphqlFactory(
  configService: ConfigService<GlobalConfig>,
): YogaDriverConfig {
  const env = configService.get('app.nodeEnv', { infer: true });
  const isDevelopment = env === 'development' || env === 'local';
  return {
    graphiql: isDevelopment,
    autoSchemaFile: path.join(
      __dirname,
      '../../src/generated/schema.generated.gql',
    ),
    include: [ApiModule],
    context: (req: FastifyRequest, res: FastifyReply) => ({ req, res }),
  };
}

export default useGraphqlFactory;
