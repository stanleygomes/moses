export interface SelectAndParseParams<V> {
  message: string;
  choices: { name: string; value: V }[];
  initialValue?: V | null;
  default?: V;
}
