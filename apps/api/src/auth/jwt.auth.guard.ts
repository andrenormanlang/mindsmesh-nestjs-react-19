import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log("JwtAuthGuard called");
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.log("No token provided");
      return false;
    }
  
    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
    } catch (e) {
      console.log("Token verification failed", e);
      return false;
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
