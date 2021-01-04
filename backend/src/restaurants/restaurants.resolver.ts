import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant) // 레스토랑의 리졸버라는 뜻. 의미가 명확하도록 추가 할 뿐 의미 없음.
export class RestaurantResolver {
  @Query(
    returns => Boolean /* 무엇을 반환하는 지 명시하는 함수 - graphql 타입*/,
  )
  // ts 문법
  isPizzaGood(): Boolean {
    return true;
  }

  @Query(returns => Restaurant)
  myRestaurant() {
    return { name: 'Kim', isGood: true };
  }

  @Query(returns => [Restaurant]) // graphql에서의 배열 타입 선언법
  // ts에서의 배열 타입 선언법
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }

  @Mutation(returns => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    console.log(createRestaurantDto);
    return true;
  }
}
