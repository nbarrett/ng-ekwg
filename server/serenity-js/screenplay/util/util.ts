export function tail<T>(results: T[]) {
  const [headItem, ...tailItems] = results;
  return tailItems;
}
