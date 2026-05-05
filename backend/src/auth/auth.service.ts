// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const userLogin = await this.prisma.userLogin.findUnique({
      where: { username },
      include: { employee: true },
    });
    if (userLogin && (await bcrypt.compare(pass, userLogin.password))) {
      const { password, ...result } = userLogin;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      employeeId: user.employeeId 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        username: user.username,
        role: user.role,
        employee: user.employee
      }
    };
  }
}
