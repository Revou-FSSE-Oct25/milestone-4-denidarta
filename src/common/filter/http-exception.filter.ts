import { Catch, ExceptionFilter } from '@nestjs/common';

interface HttpExceptionResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

}