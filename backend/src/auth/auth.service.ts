import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}
  login(): string {
    return 'Desde auth';
  }
  getUser(): string {
    return 'Desde usuario';
  }
}
