import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from '../storage/storage.service';
import { FontsController } from './fonts.controller';
import { FontsService } from './fonts.service';

@Module({
  imports: [PrismaModule],
  controllers: [FontsController],
  providers: [FontsService, StorageService],
  exports: [FontsService],
})
export class FontsModule {}
