import { contextBridge, ipcRenderer } from "electron";
import type { IpcApi } from "../shared/ipc-api";

const invoke = <P extends unknown[], R>(channel: string, ...args: P) =>
  ipcRenderer.invoke(channel, ...args) as Promise<R>;

const expose = <T extends keyof IpcApi>(apiKey: T, api: IpcApi[T]) => {
  contextBridge.exposeInMainWorld(apiKey, api);
};

expose("alarms", {
  onceLoaded: async (callback) => callback(await invoke("load-alarms")),
  onTrigger: (callback) =>
    ipcRenderer.on("alarm-trigger", (_, id: string, hour: string) =>
      callback(id, hour),
    ),
  add: (time) => invoke("add-alarm", time),
  set: (id, time) => invoke("set-alarm", id, time),
  remove: (id) => invoke("remove-alarm", id),
});
