# 우버이츠 클론 - 백엔드

우버 이츠 클론을 위한 백엔드

## 기술 스택

Nest.js, TypeORM, Typescript, PostgreSQL

## Setup

### NestJS 설치

```bash
nest g application
? What name would you like to use for the new project? backend
cd backend
npm i
npm run start:dev
http://localhost:3000
```

### [Apollo Server 설치](https://docs.nestjs.com/graphql/quick-start#installation)

```bash
npm i @nestjs/graphql graphql-tools graphql apollo-server-express
```

### Class validator 설치

```bash
npm i class-validator class-transformer
```

### 모듈 생성

```bash
nest g mo moduleName
```

### DB 설정

#### Postgresql 설정

https://www.postgresql.org/download/linux/debian/

#### Postgresql GUI 설치하기

##### MacOS(postico)

https://eggerapps.at/postico/

##### 리눅스 민트(pgAdmin)

https://medium.com/@ogunyemijeremiah/installing-pgadmin-4-on-linux-mint-20-ulyana-741b941479c9

#### pgAdmin으로 db 설정하기

- 왼쪽 패널 > Login/Group Roles 마우스 오른쪽 클릭 > Create > Login/Group Role... > 이름과 비밀번호 설정 > Save

- 왼쪽 패널 > Databases 마우스 오른쪽 클릭 > Create > Databases... > 데이터베이스 이름과 비밀번호 설정 > Save

### TypeORM 설정

https://docs.nestjs.com/techniques/database

```bash
npm install --save @nestjs/typeorm typeorm pg #postgresql
```

#### Postgresql을 NestJS와 연결

https://github.com/typeorm/typeorm#quick-start

#### .env(환경변수 파일)을 NestJS에서 읽기

```bash
npm i cross-env --save # 가상 변수를 OS에 상관없이 쓸 수 있게 해주는 모듈
```

- dotenv 사용: https://github.com/motdotla/dotenv#readme

- NestJS 방식: https://docs.nestjs.com/techniques/configuration#installation

  ```bash
  npm i --save @nestjs/config
  ```

```ts
// backend/src/app.module.ts

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, //현재 db 상태를 동기화
      logging: true, // console에 로그 표시
    }),
  ]
```

```javaScript
// package.json

// npm start:dev를 실행하면 dev라는 환경을 실행한다.
"start:dev": "cross-env NODE_ENV=dev nest start --watch"

// npm start를 실행하면 prod라는 환경을 실행한다.
"start": "cross-env NODE_ENV=prod nest start",
```

#### .env 환경 검증하기

https://github.com/sideway/joi#readme

> The most powerful schema description language and data validator for JavaScript.

```bash
npm install joi --save
```

```ts
//app.module.ts

import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema
    }),
})
```

### TypeORM으로 Entity 만들기

기존에 restaurant.entity.ts 에서 @ObjectType() 데코레이터를 통해 Graphql 스키마를 만들었다.  
여기에 @Entity(), @Column 데코레이터를 추가하여 엔티티, 컬럼을 만들 수 있다.  
즉 graphql 스키마와 db 스키마를 동시에 만들 수 있는 장점이 있다.

```ts
// restaurant.entity.ts
@ObjectType() //graphql
@Entity() // typeorm
export class Restaurant {
  @Column
  @Field(type => String)
  name: string;
}
```

```ts
// app.module.ts
TypeOrmModule.forRoot({
  // ... 생략
  entities: [Restaurant]
}),
```
