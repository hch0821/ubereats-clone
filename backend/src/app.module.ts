import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql'; //apollo-server graphql 모듈
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
@Module({
  // graphql 스키마 자동 작성
  // https://docs.nestjs.com/graphql/quick-start#code-first
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true, // 스키마 파일을 메모리에 생성
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
