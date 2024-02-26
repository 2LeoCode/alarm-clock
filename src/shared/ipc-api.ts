import type { Alarm } from "./alarm";
import type { Serialized } from "./serialized";

export type IpcApi = {
  alarms: {
    onceLoaded: (callback: (alarms: Serialized<Alarm>[]) => void) => void;
    onTrigger: (callback: (id: string) => void) => void;
    add: (time: string) => Promise<string>;
    remove: (id: string) => Promise<void>;
    set: (id: string, time: string) => Promise<void>;
  };
};
