import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator'; // 들어온 데이터 유효성 검사 모듈

/* @InputType(): gql을 작성할 때, 
mutation{
  createRestaurant(createRestaurantInput:{
    name:"",
    ...
  })
}
이런 식으로 createRestaurantInput 오브젝트를 옵션에 넣어줘야함

@ArgsType(): gql을 작성할 때, 
mutation{
  createRestaurant(name: "" ...)
}
이런 식으로 옵션을 쪼개서 넣을 수 있음
*/

@ArgsType()
export class CreateRestaurantDto {
  @Field(type => String)
  @IsString() // string인지 확인
  @Length(5, 10) // 길이 제한 5 ~ 10
  name: string;

  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @IsString()
  address: string;

  @Field(type => String)
  @IsString()
  ownerName: string;
}
