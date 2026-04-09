export class AsyncUtil {
  static async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i += 1) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown request error');

        if (i === retries) {
          break;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('Unexpected retry failure');
  }
}
