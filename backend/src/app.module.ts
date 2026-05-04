// backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AssetsModule } from "./assets/assets.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AssetsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
