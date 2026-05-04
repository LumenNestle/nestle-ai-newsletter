import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { NewsLettersModule } from './newsletters/newsletters.module';
import { TemplatesModule } from './templates/templates.module';
import { AiModule } from './ai/ai.module';
import { BrandKitModule } from './brand-kit/brand-kit.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    AreasModule,
    AuthModule,
    NewsLettersModule,
    TemplatesModule,
    AiModule,
    BrandKitModule,
    ConfigModule.forRoot({
      isGlobal: true, // no tener que importarlo en cada módulo
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
