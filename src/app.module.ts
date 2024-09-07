import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './common/config/config';

import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { DynamoDBModule} from './dynamodb/dynamodb.module'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FlashcardModule } from './flashcard/flashcard.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true , load: [config]}),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    DynamoDBModule,
    AuthModule,
    UserModule,
    FlashcardModule
    
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
