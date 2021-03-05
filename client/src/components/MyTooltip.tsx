import React, { useState } from "react";
import { Tooltip, Zoom } from "@material-ui/core";

export default function MyTooltip(props: any) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState(0);

  let timerId: number;

  props.eventHandler((account: number, change: string) => {
    if (change === props.triggerKey) {
      setTooltipData(account);
      setTooltipOpen(true);
      clearTimeout(timerId);
      timerId = setTimeout(() => setTooltipOpen(false), 1000);
    }
  });

  return (
    <Tooltip
      title={`is being edited by ${tooltipData}`}
      placeholder="bottom"
      arrow
      disableFocusListener
      disableHoverListener
      disableTouchListener
      TransitionComponent={Zoom}
      // TransitionProps={{ timeout: 300 }}
      open={tooltipOpen}
    >
      {props.children}
    </Tooltip>
  );
}
