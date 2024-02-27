import type { DateLike } from "./utils/date-like";
import type { OmitType } from "./utils/omit-type";

type OmitFunctions<T> = OmitType<T, (...args: any) => any>;

export type Serialized<T> = T extends (infer U)[]
  ? Serialized<U>[]
  : T extends number | bigint | string | boolean | null | undefined | DateLike
    ? string
    : {
        [K in keyof OmitFunctions<T>]: Serialized<OmitFunctions<T>[K]>;
      };
