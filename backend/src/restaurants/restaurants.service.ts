import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // class Restaurant extends Repository<Restaurant> 주입
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepo.find();
  }
  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurantRepo.create(createRestaurantDto);
    return this.restaurantRepo.save(newRestaurant);
  }
  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    // this.restaurants.update({name:"lalala"}, {...data}) --> search by name
    // update함수는 엔티티가 db에 존재하는지 체크하지 않는다.
    return this.restaurantRepo.update(id /*search by id*/, { ...data });
  }
}
