import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';
// express의 미들웨어 구현과 똑같다
// http request로 부터 토큰 정보를 받는다.
@Injectable() // injectable을 사용해야 constructor로 무언갈 주입하기 쉽다.
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // req, res 처리 후

    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          // 디코딩된 토큰으로 부터 아이디를 받고, db에서 user 정보를 조회한다.
          const user = await this.usersService.findById(decoded['id']);
          req['user'] = user; // graphql resolver에서 유저 정보를 처리하도록 req에 저장
          // app.module.ts => GraphqlModlue.forRoot => context에서 접근 가능
          // 최종적으로 users.resolver.ts에서 Context로 접근
        }
      } catch (e) {}
    }

    // next 함수를 반드시 호출해야 한다.
    next();
  }
}
