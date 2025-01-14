export type DataFetcherResponseDto<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data: null; error: string };
