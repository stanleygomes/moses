export class JsonUtil {
  static async parse<T>(content: string): Promise<T> {
    return JSON.parse(content) as T;
  }
}
