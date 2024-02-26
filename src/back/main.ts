import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import dayjs from "dayjs";
import { randomUUID } from "crypto";
import type { Serialized } from "@shared/serialized";
import type { Alarm } from "@shared/alarm";
import { open as openDatabase } from "sqlite";
import sqlite3 = require("sqlite3");

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

let time = dayjs();

const createWindow = () => {
  const win = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(process.env.DIST, "index.html"));
  return win;
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app
  .on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  })
  .on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

app.whenReady().then(async () => {
  const db = await openDatabase({
    filename: "alarm.db",
    driver: sqlite3.Database,
  });

  await db.exec(
    "CREATE TABLE IF NOT EXISTS alarms (id CHAR(36), time DATETIME)",
  );

  ipcMain.handle("add-alarm", async (_, time: string) => {
    const id = randomUUID();
    await db.run("INSERT INTO alarms VALUES (?, ?)", [id, time]);
    return id;
  });
  ipcMain.handle("set-alarm", async (_, id: string, time: string) => {
    const res = await db.run("UPDATE alarms SET time = ? WHERE id = ?", [
      time,
      id,
    ]);
    if (res.changes === 0) throw new Error("Alarm not found");
  });
  ipcMain.handle("remove-alarm", async (_, id: string) => {
    const res = await db.run("DELETE FROM alarms WHERE id = ?", [id]);
    if (res.changes === 0) throw new Error("Alarm not found");
  });
  ipcMain.handle("load-alarms", () => {
    return db.all("SELECT * FROM alarms");
  });

  const win = createWindow();

  const loop = async () => {
    time = dayjs();
    await db.each(
      "SELECT * FROM alarms",
      async (err, row: Serialized<Alarm>) => {
        if (err) throw err;
        const alarmTime = dayjs(row.time);
        if (alarmTime.isBefore(time)) {
          win.webContents.send(
            "alarm-trigger",
            row.id,
            alarmTime.format("HH:mm"),
          );
          await db.run("DELETE FROM alarms WHERE id = ?", [row.id]);
        }
      },
    );
    setImmediate(loop);
  };
  loop();
});
