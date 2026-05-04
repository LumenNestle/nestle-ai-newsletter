import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthorizationService } from '../modules/auth/services/authorization.service';
import { PermissionsGuard } from '../modules/auth/guards/permissions.guard';

@Module({
  imports: [PrismaModule, ConfigModule, SupabaseModule],
  controllers: [AiController],
  providers: [AiService, AuthorizationService, PermissionsGuard],
})
export class AiModule {}
