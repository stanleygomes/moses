import { input, select } from '@inquirer/prompts';
import type { AskAndParseParams } from '../types/ask-params.type.js';
import type { SelectAndParseParams } from '../types/select-params.type.js';

export class Prompt {
  public static async ask<T>({
    message,
    schema,
    initialValue,
    default: defaultValue,
  }: AskAndParseParams<T>): Promise<T> {
    if (initialValue) return schema.parse(initialValue);

    const validate = (val: string) => {
      const result = schema.safeParse(val);
      if (result.success) return true;
      return result.error.issues[0].message;
    };

    const rawValue = await input({ message, default: defaultValue, validate });
    return schema.parse(rawValue);
  }

  public static async select<V>({
    message,
    choices,
    initialValue,
    default: defaultValue,
  }: SelectAndParseParams<V>): Promise<V> {
    if (initialValue) return initialValue;

    return select({
      message,
      choices,
      default: defaultValue,
    });
  }
}
