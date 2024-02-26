import "./App.css";

import { useState, useEffect, useRef } from "react";
import type { Alarm } from "@shared/alarm";
import AlarmEditor from "./components/AlarmEditor";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { errorAlert } from "@shared/error";
import Swal from "sweetalert2";

const App = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [time, setTime] = useState(dayjs());
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | "new" | null>(
    null,
  );
  const frameRef = useRef(0);

  const addAlarm = async (time: Dayjs) => {
    const id = await window.alarms.add(time.format("YYYY-MM-DD HH:mm:ss"));
    setAlarms([...alarms, { id, time }]);
    return id;
  };

  const setAlarm = async (id: string, time: Dayjs) => {
    try {
      await window.alarms.set(id, time.format("YYYY-MM-DD HH:mm:ss"));
    } catch (error) {
      errorAlert(error);
      return;
    }

    setAlarms(alarms.map((alarm) => (alarm.id === id ? { id, time } : alarm)));
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

  useEffect(() => {
    window.alarms.onceLoaded((data) => {
      setAlarms(data.map(({ id, time }) => ({ id, time: dayjs(time) })));
    });
    window.alarms.onTrigger((id, hour) => {
      const audio = new Audio("/sounds/mixkit-scanning-sci-fi-alarm-905.wav");
      audio.onplaying = () => {
        Swal.fire({
          title: "Alarm",
          text: hour,
          preConfirm: () => audio.pause(),
        });
      };
      audio.play();
      setSelectedAlarm((alarm) =>
        alarm !== "new" && alarm?.id === id ? null : alarm,
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
                {alarm.time.format("YYYY/MM/DD HH:mm")}
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
