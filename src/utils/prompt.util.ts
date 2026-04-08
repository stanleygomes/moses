import { confirm, input, password, select } from '@inquirer/prompts';
import type { AskAndParseParams } from '../types/ask-params.type.js';
import type { SelectAndParseParams } from '../types/select-params.type.js';
import type { ConfirmParams } from '../types/confirm-params.type.js';
import type { PasswordParams } from '../types/password-params.type.js';

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

  public static async confirm({
    message,
    default: defaultValue,
    initialValue,
  }: ConfirmParams): Promise<boolean> {
    if (initialValue !== undefined && initialValue !== null) return initialValue;

    return confirm({
      message,
      default: defaultValue ?? true,
    });
  }

  public static async password<T = string>({
    message,
    schema,
    initialValue,
    mask,
  }: PasswordParams<T>): Promise<T> {
    if (initialValue) return schema ? schema.parse(initialValue) : (initialValue as unknown as T);

    const validate = (val: string) => {
      if (!schema) return true;
      const result = schema.safeParse(val);
      if (result.success) return true;
      return result.error.issues[0].message;
    };

    const rawValue = await password({
      message,
      mask: mask ?? '*',
      validate,
    });

    return schema ? schema.parse(rawValue) : (rawValue as unknown as T);
  }
}
