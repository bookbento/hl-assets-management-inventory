import { Module } from '@nestjs/common';
import { BusinessUnitService } from './business-unit.service';
import { BusinessUnitController } from './business-unit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessUnitController],
  providers: [BusinessUnitService],
})
export class BusinessUnitModule {}
