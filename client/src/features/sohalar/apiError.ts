import { isAxiosError } from 'axios'

interface ErrorResponseBody {
  message?: string | string[]
}

/**
 * Pulls the human-readable message out of the backend's uniform error shape
 * (`{ statusCode, timestamp, path, message }`). `class-validator` failures
 * come back as a string array, so those get joined.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ErrorResponseBody>(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ')
    }
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }
  return fallback
}
