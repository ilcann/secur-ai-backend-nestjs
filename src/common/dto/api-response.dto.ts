export class ApiResponse<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
}
