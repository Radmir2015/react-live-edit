import { createStyles, makeStyles, TextField, Theme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { subscribeToGlobalState, dispatchGlobalState } from "../api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      minWidth: 165
    },
    marginForField: {
      marginBottom: theme.spacing(3)
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    }
  })
);

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
