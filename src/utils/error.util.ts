export class ErrorUtil {
  static getMessage(error: unknown, fallback = 'Unknown error'): string {
    return error instanceof Error ? error.message : fallback;
  }
}
