// 가드는 http request를 다음 단계로 진행할 지 말지를 결정한다.
// https://docs.nestjs.com/guards

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// 클라이언트로부터 받은 토큰에 user 정보가 있는 지 확인
// 없으면 http request 막음
@Injectable()
export class AuthGaurd implements CanActivate {
  canActivate(context: ExecutionContext) {
    // http context => graphql context로 변환
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    if (!user) {
      return false; // block request
    }
    return true; // continue request
  }
}
