import type { Alarm } from "@shared/alarm";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { StaticDateTimePicker } from "@mui/x-date-pickers";

type AlarmEditorProps = {
  selectedAlarm: Alarm | "new";
  addAlarm: (time: Dayjs) => Promise<string>;
  setAlarm: (id: string, time: Dayjs) => void;
  removeAlarm: (id: string) => void;
  exitEditor: () => void;
};

export const AlarmEditor = (props: AlarmEditorProps) => {
  const [time, setTime] = useState(
    props.selectedAlarm === "new"
      ? dayjs().set("s", 0).add(1, "m")
      : props.selectedAlarm.time,
  );

  return (
    <>
      <StaticDateTimePicker
        value={time}
        onChange={(value) => setTime(value ?? dayjs())}
        onAccept={() => {
          if (time.isBefore(dayjs())) {
            alert("You can't set an alarm in the past!");
            return;
          }
          if (props.selectedAlarm == "new") props.addAlarm(time);
          else props.setAlarm(props.selectedAlarm.id, time);
        }}
        onClose={() => props.exitEditor()}
        minDate={dayjs()}
        minTime={
          time.format("YYYYMMDD") === dayjs().format("YYYYMMDD")
            ? dayjs().set("s", 0).add(1, "m")
            : undefined
        }
      />
    </>
  );
};

export default AlarmEditor;
