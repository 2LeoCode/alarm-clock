import type { Alarm } from "@shared/types/alarm";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { PickersActionBar, StaticDateTimePicker } from "@mui/x-date-pickers";
import Swal from "sweetalert2";

import "./AlarmEditor.css";
import { TextField } from "@mui/material";

type AlarmEditorProps = {
  selectedAlarm: Alarm | "new";
  addAlarm: (time: Dayjs, description: string) => Promise<void>;
  setAlarm: (id: string, time: Dayjs, description: string) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  exitEditor: () => void;
};

const EmptyActionBar = () => (
  <PickersActionBar
    onAccept={() => false}
    onCancel={() => false}
    onClear={() => false}
    onSetToday={() => false}
    // actions={["accept", "cancel"]}
  />
);

export const AlarmEditor = (props: AlarmEditorProps) => {
  const [time, setTime] = useState(
    props.selectedAlarm === "new"
      ? dayjs().set("s", 0).add(1, "m")
      : props.selectedAlarm.time,
  );
  const [description, setDescription] = useState(
    props.selectedAlarm === "new" ? "" : props.selectedAlarm.description,
  );

  return (
    <div id="alarm-editor">
      <TextField
        value={description}
        label="Description"
        variant="filled"
        onChange={(e) => {
          if (e.target.value.length > 100) return;
          setDescription(e.target.value);
        }}
      />
      <StaticDateTimePicker
        value={time}
        onChange={(value) => setTime(value ?? dayjs())}
        onAccept={() => {
          if (time.isBefore(dayjs())) {
            Swal.fire({
              title: "Error",
              text: "You can't set an alarm in the past!",
              icon: "error",
            });
            return;
          }
          if (props.selectedAlarm == "new") props.addAlarm(time, description);
          else props.setAlarm(props.selectedAlarm.id, time, description);
        }}
        onClose={() => props.exitEditor()}
        minDateTime={dayjs().set("s", 0).add(1, "m")}
        slots={{
          actionBar: EmptyActionBar,
        }}
      />
      <PickersActionBar
        onAccept={() => {
          if (time.isBefore(dayjs())) {
            Swal.fire({
              title: "Error",
              text: "You can't set an alarm in the past!",
              icon: "error",
            });
            return;
          }
          if (props.selectedAlarm == "new") props.addAlarm(time, description);
          else props.setAlarm(props.selectedAlarm.id, time, description);
          props.exitEditor();
        }}
        onCancel={() => props.exitEditor()}
        onClear={() => {}}
        onSetToday={() => {}}
        actions={["accept", "cancel"]}
      />
    </div>
  );
};

export default AlarmEditor;
