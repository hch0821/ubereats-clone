import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])], // import: 엔티티 같은 것을 가져옴
  providers: [UsersResolver, UsersService], // provider: userService를 갖고 있음
  exports: [UsersService], // exports: 다른 곳에서도 userService를 주입할 수 있도록 함
})
export class UsersModule {}
