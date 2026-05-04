import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandKitService {
  constructor() {}

  getAll(): string {
    return 'Desde brand kit';
  }

  create(): string {
    return 'Creando brand kit';
  }

  update(id: string): string {
    return `Actualizando brand kit con id: ${id}`;
  }
}
