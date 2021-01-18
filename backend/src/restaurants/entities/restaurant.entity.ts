/*데이터베이스에 있는 모델과 비슷*/

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Restaurant을 위한 Object Type 생성
@InputType({ isAbstract: true })
@ObjectType() //gql
@Entity() // typeorm
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String) //gql
  @Column() //typeorm
  @IsString()
  @Length(5)
  name: string;

  @Field(type => Boolean, { nullable: true })
  @Column({ default: true }) // null일 때 default 값으로 true를 줌
  @IsOptional() // Nullable과 같음
  @IsBoolean()
  isVegan?: boolean;

  @Field(type => String, { defaultValue: 'lalalal' })
  @Column()
  @IsString()
  address: string;
}
