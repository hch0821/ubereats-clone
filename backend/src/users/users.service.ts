import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    //app.module.ts에서 설정하고, users.module.ts에서 import 했기 때문에 주입할 수 있다.
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // check new user
    try {
      const exists = await this.userRepo.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // create user
      await this.userRepo.save(this.userRepo.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not create account' };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // find the user with the email
    try {
      const user = await this.userRepo.findOne({ email });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      // check if the password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // make a JWT and give it to the user
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.userRepo.findOne({ id });
  }

  async editProfile(userId: number, { email, password }: EditProfileInput) {
    // update email,password where id === userId

    // repository.update 함수는 db에 쿼리 요청만 하고 엔티티를 실제로 업데이트하지 않기 때문에
    // user.entity.ts에 있는 BeforeUpdate 데코레이터를 실행하지 못한다. ==> save를 이용하자
    const user = await this.userRepo.findOne(userId);
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    /*
    Saves a given entity in the database. If entity does not exist in the database then inserts, otherwise updates.
    */
    return this.userRepo.save(user);
  }
}
