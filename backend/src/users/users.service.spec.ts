import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

// 가짜 user 레포지토리 함수 만들기
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let userRepo: MockRepository<User>;
  let veriRepo: MockRepository<Verification>;
  let mailService: MailService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      // 서비스를 가져올 때 멤버함수를 가짜로 생성
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    userRepo = module.get(getRepositoryToken(User));
    veriRepo = module.get(getRepositoryToken(Verification));
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };
    it('should fail if user exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'alalalala',
      }); //가짜로 promise return
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('should create a new user', async () => {
      userRepo.findOne.mockResolvedValue(undefined);

      userRepo.create.mockReturnValue(createAccountArgs);
      userRepo.save.mockResolvedValue(createAccountArgs);

      veriRepo.create.mockReturnValue({ user: createAccountArgs });
      veriRepo.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(userRepo.create).toHaveBeenCalledTimes(1); // create 함수가 한 번만 실행될 것이라 예측
      expect(userRepo.create).toHaveBeenCalledWith(createAccountArgs); // create 함수 파라미터 확인

      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith(createAccountArgs);

      expect(veriRepo.create).toHaveBeenCalledTimes(1);
      expect(veriRepo.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(veriRepo.save).toHaveBeenCalledTimes(1);
      expect(veriRepo.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      userRepo.findOne.mockRejectedValue(new Error()); //가짜 에러 발생시킴

      const result = await service.createAccount(createAccountArgs);
      console.log({ result });
      expect(result).toEqual({ ok: false, error: 'Could not create account' });
    });
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
