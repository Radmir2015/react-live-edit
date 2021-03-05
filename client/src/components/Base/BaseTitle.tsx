import { TextField } from "@material-ui/core";
import React from "react";

interface BasePropsType {
  title: string;
  handle: (event: React.ChangeEvent<{ value: unknown }>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const BaseTitle = (props: BasePropsType) => {
  return (
    <div>
      <TextField
        label="Title"
        variant="standard"
        value={props.title.toString()}
        onChange={props.handle}
        disabled={props.disabled}
      />
    </div>
  );
};

export default BaseTitle;
