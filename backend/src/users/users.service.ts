import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Verification)
    private readonly veriRepos: Repository<Verification>,
    //app.module.ts에서 설정하고, users.module.ts에서 import 했기 때문에 주입할 수 있다.
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // check new user
    try {
      const exists = await this.userRepo.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // create user
      const user = await this.userRepo.save(
        this.userRepo.create({ email, password, role }),
      );
      const verification = await this.veriRepos.save(
        this.veriRepos.create({
          user,
        }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);

      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not create account' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    try {
      const user = await this.userRepo.findOne(
        { email },
        { select: ['id', 'password'] },
      );
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

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    // update email,password where id === userId
    // repository.update 함수는 db에 쿼리 요청만 하고 엔티티를 실제로 업데이트하지 않기 때문에
    // user.entity.ts에 있는 BeforeUpdate 데코레이터를 실행하지 못한다. ==> save를 이용하자
    try {
      const user = await this.userRepo.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.veriRepos.delete({ user });
        const verification = await this.veriRepos.save(
          this.veriRepos.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      /*
      Saves a given entity in the database. If entity does not exist in the database then inserts, otherwise updates.
      */
      this.userRepo.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.veriRepos.findOne(
        { code },
        // { loadRelationIds: true }, -> 릴레이션 아이디만 가져오기
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        this.userRepo.save(verification.user);
        await this.veriRepos.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'The verifcation is not exists',
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
