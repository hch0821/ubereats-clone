import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

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

@InputType()
// Restaurent 엔티티에서 id를 제외하고 가져옴. OmitType은 InputType클래스에만 동작하므로,
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
