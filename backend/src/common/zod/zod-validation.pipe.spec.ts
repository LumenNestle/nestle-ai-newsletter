import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  it('returns parsed data when payload is valid', () => {
    const schema = z.object({
      id: z.string().uuid(),
    });
    const pipe = new ZodValidationPipe(schema);
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
    };

    expect(pipe.transform(payload)).toEqual(payload);
  });

  it('throws a bad request exception when payload is invalid', () => {
    const schema = z.object({
      id: z.string().uuid('Debe ser un UUID valido.'),
    });
    const pipe = new ZodValidationPipe(schema);

    expect(() => pipe.transform({ id: 'invalid-id' })).toThrow(
      BadRequestException,
    );
  });
});
