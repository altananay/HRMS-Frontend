import 'server-only';

import type { ApiError, ApiErrorCode } from '@/contracts/api-error';

import { toFieldErrors } from './field-errors';

type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

export async function toApiError(response: Response, hadSession = false): Promise<ApiError> {
  const problem = await readProblemDetails(response);
  const code = toCode(response.status, problem, hadSession);

  const error: ApiError = {
    status: response.status,
    code,
    title: problem?.title ?? response.statusText ?? 'Error',
  };

  if (problem?.detail) error.detail = problem.detail;

  if (code === 'validation' && problem?.errors) {
    error.fieldErrors = toFieldErrors(problem.errors);
  }

  return error;
}

export function networkError(cause: unknown): ApiError {
  return {
    status: 0,
    code: 'network',
    title: cause instanceof Error ? cause.message : 'Network request failed',
  };
}

async function readProblemDetails(response: Response): Promise<ProblemDetails | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('json')) return null;

  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null ? (body as ProblemDetails) : null;
  } catch {
    return null;
  }
}

function toCode(status: number, problem: ProblemDetails | null, hadSession: boolean): ApiErrorCode {
  switch (status) {
    case 400:
      return problem?.errors && Object.keys(problem.errors).length > 0 ? 'validation' : 'business';
    case 401:
      return hadSession ? 'session_expired' : 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 429:
      return 'rate_limited';
    default:
      if (status >= 500) return 'server';
      return 'unknown';
  }
}
