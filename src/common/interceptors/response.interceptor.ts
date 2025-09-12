import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * Standart Response Interceptor.
 * Controller'dan dönen ApiResponse<T> ile uyumlu.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements
    NestInterceptor<ApiResponse<T>, ApiResponse<T> & { statusCode: number }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<ApiResponse<T>>,
  ): Observable<ApiResponse<T> & { statusCode: number }> {
    return next.handle().pipe(
      map((apiRes) => ({
        statusCode: 200,
        ...apiRes,
      })),
    );
  }
}
