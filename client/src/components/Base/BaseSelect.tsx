import {
  createStyles,
  makeStyles,
  InputLabel,
  Theme,
  FormControl,
  MenuItem,
  Select
} from "@material-ui/core";
import React from "react";
import { IHOCPropsType } from "../HOC/IHOC";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      minWidth: 165
    }
  })
);

const BaseTitle = (props: IHOCPropsType & { disabled?: boolean }) => {
  const classes = useStyles();

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="doctype">Doc type</InputLabel>
        <Select
          labelId="doctype"
          id="select"
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
        >
          <MenuItem value="hp">H&P Note</MenuItem>
          <MenuItem value="cn">Consult Note</MenuItem>
          <MenuItem value="dr">Diagnostic Report</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default BaseTitle;
