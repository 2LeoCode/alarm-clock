export type Serialized<T> = {
  [K in keyof T]: string;
};
