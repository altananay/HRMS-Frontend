export const API_ERROR_CODES = [
  'validation',
  'business',
  'unauthorized',
  'invalid_credentials',
  'session_expired',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'server',
  'network',
  'unknown',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiError = {
  status: number;
  code: ApiErrorCode;
  title: string;
  detail?: string;
  fieldErrors?: Record<string, string[]>;
};

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'status' in value &&
    typeof (value as ApiError).status === 'number'
  );
}
