/*데이터베이스에 있는 모델과 비슷*/

import { Field, ObjectType } from '@nestjs/graphql';

// Restaurant을 위한 Object Type 생성
@ObjectType()
export class Restaurant {
  @Field(type => String)
  name: string;
  @Field(type => Boolean)
  isVegan?: boolean;

  @Field(type => String)
  address: string;

  @Field(type => String)
  ownerName: string;
}
