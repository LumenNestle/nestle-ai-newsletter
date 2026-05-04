import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodIssue, ZodType } from 'zod';

type ValidationErrorDetail = {
  field: string;
  message: string;
};

@Injectable()
export class ZodValidationPipe<TOutput> implements PipeTransform<
  unknown,
  TOutput
> {
  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    const validationResult = this.schema.safeParse(value);

    if (validationResult.success) {
      return validationResult.data;
    }

    throw new BadRequestException({
      message: 'Los datos enviados no son validos.',
      errors: validationResult.error.issues.map((issue) =>
        this.mapIssue(issue),
      ),
    });
  }

  private mapIssue(issue: ZodIssue): ValidationErrorDetail {
    return {
      field: issue.path.length > 0 ? issue.path.join('.') : 'request',
      message: issue.message,
    };
  }
}
