// src/modules/auth/auth.module.ts
import { Global, Module } from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';
import { PermissionCacheService } from './services/permission-cache.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PrismaService } from '../../prisma/prisma.service'; 

@Global()
@Module({
  providers: [
    PrismaService,           
    PermissionCacheService,  
    AuthorizationService,    
    PermissionsGuard,        
  ],
  exports: [
    AuthorizationService,  
    PermissionCacheService,  
    PermissionsGuard,        
  ],
})
export class AuthModule {}