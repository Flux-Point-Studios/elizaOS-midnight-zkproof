export function contains(arr: string[], query: string): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === query) return true;
  }
  return false;
} 