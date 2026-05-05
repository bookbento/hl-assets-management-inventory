// backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessUnitModule } from "./business-unit/business-unit.module";
import { DepartmentModule } from "./department/department.module";
import { EmployeeModule } from "./employee/employee.module";
import { AssetModule } from "./asset/asset.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BusinessUnitModule,
    DepartmentModule,
    EmployeeModule,
    AssetModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
