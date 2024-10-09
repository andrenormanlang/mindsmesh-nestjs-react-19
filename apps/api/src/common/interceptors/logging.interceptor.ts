import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    const now = Date.now();
    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Completed Request: ${method} ${url} - ${Date.now() - now}ms`)),
      );
  }
}
