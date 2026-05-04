// backend/src/assets/assets.module.ts
import { Module } from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { AssetsController } from "./assets.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule], // Import AuthModule for guards
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
