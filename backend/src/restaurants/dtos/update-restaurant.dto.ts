import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

//partialtype은 멤버변수의 값이 nullable 허용
@InputType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantDto,
) {}

@InputType()
export class UpdateRestaurantDto {
  @Field(type => Number)
  id: number;

  @Field(type => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
