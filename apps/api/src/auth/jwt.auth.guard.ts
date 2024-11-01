import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      return false;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.log("JWT_SECRET is missing from environment variables");
        return false;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, { secret });
      request['user'] = payload; // Setting the verified payload as the user
    } catch (e) {
      console.log("Token verification failed:", e.message);
      return false;
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
