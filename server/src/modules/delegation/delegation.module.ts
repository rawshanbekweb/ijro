import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Delegation } from './delegation.entity';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Delegation, User])],
  controllers: [DelegationController],
  providers: [DelegationService],
  exports: [DelegationService],
})
export class DelegationModule {}
