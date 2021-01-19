import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql'; //apollo-server graphql 모듈
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 어느 곳에서든지 접근 가능
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test', // 환경이 dev(개발)일 때 .env.dev 파일 참조
      ignoreEnvFile: process.env.NODE_ENV === 'prod', //환경이 prod(배포) 환경변수 파일을 사용하지 않음
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod')
          .required(), // 환경은 prod 또는 dev여야만 한다.
        // 포트, 유저이름, 비번, db이름은 string이어야만 한다.
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', //typeorm과 db 항상 동기화
      logging: process.env.NODE_ENV !== 'prod', // console에 로그 표시
      entities: [User],
    }),
    // graphql 스키마 자동 작성
    // https://docs.nestjs.com/graphql/quick-start#code-first
    GraphQLModule.forRoot({
      autoSchemaFile: true, // 스키마 파일을 메모리에 생성
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
