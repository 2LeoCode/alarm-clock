export type OmitType<T, U> = Omit<
  T,
  {
    [K in keyof T]: T[K] extends U ? K : never;
  }[keyof T]
>;
