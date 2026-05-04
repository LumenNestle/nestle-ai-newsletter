import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();

    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];
    const area = request.headers['x-area'];

    // Si faltan los headers, lanzamos una excepción específica
    if (!userId || !userRole || !area) {
      throw new UnauthorizedException({
        message: 'Faltan credenciales de Mockup',
        error: 'Headers x-user-id, x-user-role o x-area no encontrados',
        statusCode: 401
      });
    }

    request.user = {
      id: userId,
      role: userRole,
      area: area
    };

    return true;
  }
}