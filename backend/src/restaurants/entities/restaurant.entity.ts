/*데이터베이스에 있는 모델과 비슷*/

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Restaurant을 위한 Object Type 생성
@ObjectType() //gql
@Entity() // typeorm
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String) //gql
  @Column() //typeorm
  name: string;

  @Field(type => Boolean)
  @Column()
  isVegan?: boolean;

  @Field(type => String)
  @Column()
  address: string;

  @Field(type => String)
  @Column()
  ownerName: string;

  @Field(type => String)
  @Column()
  categoryName: string;
}
