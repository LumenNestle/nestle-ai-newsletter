import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from '../storage/storage.service';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AssetsController],
  providers: [AssetsService, StorageService],
})
export class AssetsModule {}
