export type ServiceResponseDto<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data: null; error: string };
