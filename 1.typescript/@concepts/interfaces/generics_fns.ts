function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

console.log(getFirstItem<number>([10, 20, 30]));
console.log(getFirstItem<string>(["a", "b", "c"]));
