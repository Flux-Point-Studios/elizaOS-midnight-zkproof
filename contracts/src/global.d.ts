declare module "@midnight/compact" {
  export function disclose(value: unknown): void;
  export function witness<T>(name: string): T;
  export function hash(value: unknown): string;
} 