# 우버이츠 클론 - 백엔드

우버 이츠 클론을 위한 백엔드

## 기술 스택

Nest.js, TypeORM, Typescript, PostgreSQL

## Setup

<details markdown="1">
<summary>접기/펼치기</summary>

<!--summary 아래 빈칸 공백 두고 내용을 적는공간-->

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

#### Data Mapper vs Active Record

https://typeorm.io/#/active-record-data-mapper

- Active Record 방식은 엔티티 클래스에 BaseEntity를 extends하여 간단히 entity 쿼리를 실행할 수 있다.  
  간단하게 앱을 만들 때 사용한다.

- Data Mapper 방식은 Entity를 담당하는 Repository 클래스를 따로 만들어서 CRUD 함수를 정의하고 실행할 수 있다. Spring Data JPA의 Repository 클래스와 비슷하다.  
  유지보수가 필요한 대규모 앱을 만들 때 사용한다. NestJS에서 Unit Test를 할 때 이 방식이 더 유리하다.

#### Repository 만들고 Service에 연결하기

```ts
// restaurants.module.ts

@Module({
  /*레스토랑 엔티티 가져오기*/,
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
  ]
  providers: [
    RestaurantResolver,
    RestaurantService /*리졸버에 서비스 주입하기 위해 작성*/,
  ],
})
export class RestaurantsModule {}
```

```ts
// restaurants.resolver.ts

@Resolver(of => Restaurant)
export class RestaurantResolver {
  // 레스토랑 서비스 주입하기
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }
```

```ts
// restaurants.service.ts
@Injectable()
export class RestaurantService {
  // 레스토랑 레포지토리(dao) 주입하기
  constructor(
    @InjectRepository(Restaurant) // class Restaurant extends Repository<Restaurant> 주입
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }
}
```

#### dto 멤버변수를 엔티티에 있는 것들로 자동 채우기

https://docs.nestjs.com/graphql/mapped-types

기존에 작성해두었던 create-restaurant.dto.ts에 restaurant.entity.ts에서 추가한 categoryName이 없다.  
이를 수동으로 추가해줄 수도 있지만 자동으로 추가할 수 있다.

- 방법 1

  ```ts
  // create-restaurant.dto.ts

  @InputType()
  // Restaurent 엔티티에서 id를 제외하고 가져옴. OmitType은 InputType클래스에만 동작하므로,
  // Restaurant의 데코레이터를 InputType으로 바꾸도록 파라미터에 추가
  export class CreateRestaurantDto extends OmitType(
    Restaurant,
    ['id'],
    InputType,
  ) {}
  ```

- 방법 2

  ```ts
  // create-restaurant.dto.ts

  @InputType()
  // Restaurant를 InputType으로 변경하지 않는다.
  export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
  ```

  ```ts
  // restaurant.entity.ts

  @InputType({ isAbstract: true }) // 타입을 두 개를 쓰면 규칙에 어긋나므로, 추상적 클래스로 extends하겠다는 뜻
  @ObjectType() //gql
  @Entity()
  export class Restaurant {}
  ```

  </details>

## User 구현

<details markdown="1">
<summary>접기/펼치기</summary>

### User Entity

- id
- createdAt
- updatedAt

- email
- password
- role(client `손님` |owner `가게주인` | delivery `배달원`)

### User CRUD:

- Create Account
- Log in
- See Profile
- Edit Profile
- Verify Email

### Hashing password

https://github.com/kelektiv/node.bcrypt.js#readme

```bash
npm i bcrypt --save
npm i @types/bcrypt --dev-only
```

```ts
// user.entity.ts

/* 사용자가 만들어져 DB에 저장하기 전에 (userRepo.save())
   인스턴스의 비밀번호 암호화 */
@BeforeInsert()
async hashPassword(): Promise<void> {
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (e) {
    console.log(e);
    throw new InternalServerErrorException();
  }
}
```

### Comparing password

```ts
// user.entity.ts

// 사용자가 입력한 평문 비밀번호(aPassword)와
// db에 저장되어있는 암호화된 비밀번호를 비교(this.password)
async checkPassword(aPassword: string): Promise<boolean> {
    try {

      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
```

### User Authentication

누가 자원을 요청하는 지 확인하는 과정

- nestjs의 passport나 passport-jwt를 사용하지 않고 직접 구현
- json web token 모듈을 사용하여 JWT 생성
  https://www.npmjs.com/package/jsonwebtoken

  ```bash
  npm i jsonwebtoken --save
  npm i @types/jsonwebtoken --only-dev # 설치한 모듈이 js 기반이기 때문에 typescript로 변환하여 설치
  ```

- 사용자들은 토큰 내부의 담긴 정보를 알 수 있고, 해독을 할 수 있기 때문에 아이디 같은 정보만 담는 것이 좋다.

- https://randomkeygen.com/ 에서 랜덤 토큰 키를 받을 수 있다.
- 토큰 키는 서버에서 토큰(json web token)이 진짜인지 아닌지 구별할 수 있게 한다.
  </details>
