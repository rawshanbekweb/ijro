import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Soha } from './soha.entity';
import { SohalarController } from './sohalar.controller';
import { SohalarService } from './sohalar.service';

@Module({
  imports: [TypeOrmModule.forFeature([Soha, User])],
  controllers: [SohalarController],
  providers: [SohalarService],
  exports: [SohalarService],
})
export class SohalarModule {}
