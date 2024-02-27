import "./App.css";

import { useState, useRef, useMemo } from "react";
import type { Alarm } from "@shared/types/alarm";
import AlarmEditor from "./components/AlarmEditor";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { errorAlert } from "./utils/error-alert";
import Swal from "sweetalert2";

const App = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [time, setTime] = useState(dayjs());
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | "new" | null>(
    null,
  );
  const frameRef = useRef(0);

  const addAlarm = async (time: Dayjs, description: string) => {
    for (const alarm of alarms) {
      if (alarm.time.isSame(time)) {
        Swal.fire({
          title: "Error",
          text: `An alarm is already set at ${time.format("HH:mm")}!`,
          icon: "error",
        });
        return;
      }
    }

    const id = await window.alarms.add(
      time.format("YYYY-MM-DD HH:mm:ss"),
      description,
    );
    setAlarms([...alarms, { id, time, description }]);
  };

  const setAlarm = async (id: string, time: Dayjs, description: string) => {
    try {
      await window.alarms.set(
        id,
        time.format("YYYY-MM-DD HH:mm:ss"),
        description,
      );
    } catch (error) {
      errorAlert(error);
      return;
    }

    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { id, time, description } : alarm,
      ),
    );
  };

  const removeAlarm = async (id: string) => {
    try {
      await window.alarms.remove(id);
    } catch (error) {
      alert(error);
      return;
    }

    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  const exitEditor = () => setSelectedAlarm(null);

  useMemo(() => {
    window.alarms.onceLoaded((data) => {
      const deserialized = data.map((alarm) => ({
        ...alarm,
        time: dayjs(alarm.time),
      }));
      const triggered = deserialized.filter(({ time }) =>
        time.isBefore(dayjs()),
      );

      if (triggered.length)
        Swal.fire({
          title: `${triggered.length} alarm${triggered.length > 1 ? "s were" : " was"} triggered during your absence`,
          html: `<ul>${triggered
            .map(
              ({ time, description }) =>
                `<li>${time.format("YYYY/MM/DD HH:mm")} ${description}</li>`,
            )
            .join("\n")}</ul>`,
        });
      setAlarms(deserialized.filter((alarm) => !triggered.includes(alarm)));
    });
    window.alarms.onTrigger((id, hour, description) => {
      const audio = new Audio("/sounds/mixkit-scanning-sci-fi-alarm-905.wav");
      audio.addEventListener("playing", () => {
        Swal.fire({
          title: hour,
          text: description,
          didClose: () => audio.pause(),
        });
      });
      audio.play();
      setSelectedAlarm((alarm) =>
        alarm !== "new" && alarm?.id === id ? "new" : alarm,
      );
      setAlarms((alarms) => alarms.filter((alarm) => alarm.id !== id));
    });

    const animate = () => {
      setTime(dayjs());
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return selectedAlarm ? (
    <AlarmEditor
      {...{
        selectedAlarm,
        addAlarm,
        setAlarm,
        removeAlarm,
        exitEditor,
      }}
    />
  ) : (
    <div id="main">
      <div id="clock">{time.format("HH:mm:ss")}</div>
      <div id="alarms">
        <div id="alarms-title">
          <h1 style={{ color: "gray" }}>Alarms</h1>
          <div id="alarm-adder" onClick={async () => setSelectedAlarm("new")}>
            +
          </div>
        </div>
        <div id="alarm-list">
          {alarms.map((alarm) => (
            <div key={alarm.id} className="alarm">
              <div onClick={() => setSelectedAlarm(alarm)}>
                {alarm.time.format("YYYY/MM/DD HH:mm")} {alarm.description}
              </div>
              <div
                className="alarm-remover"
                onClick={() => removeAlarm(alarm.id)}
              >
                -
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
