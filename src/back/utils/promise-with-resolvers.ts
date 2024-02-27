type Resolver<T> = (value: T | PromiseLike<T>) => void;
type Rejecter = (error: unknown) => void;

export const promiseWithResolvers = <T>(): [
  Promise<T>,
  Resolver<T>,
  Rejecter,
] => {
  let resolve: Resolver<T>;
  let reject: Rejecter;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return [promise, resolve!, reject!];
};
