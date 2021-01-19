import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
// user 데코레이터 구현
// 현재 로그인된 사용자를 반환한다.
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // http context => graphql context로 변환
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
