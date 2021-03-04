import React, { useEffect, useState } from "react";
import BaseSelect from "../Base/BaseSelect";

const stateKey = "select";

const LiveSelect = (props: {
  live: { dispatch: Function; subscribe: Function };
}) => {
  const [docType, setDocType] = useState("");

  useEffect(() => {
    props.live.subscribe(
      (_err: any, state: any) =>
        stateKey in state && setDocType(state[stateKey])
    );
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDocType(event.target.value as string);
    props.live.dispatch({ [stateKey]: event.target.value });
  };

  return (
    <div>
      <BaseSelect value={docType} onChange={handleChange} />
    </div>
  );
};

export default LiveSelect;
