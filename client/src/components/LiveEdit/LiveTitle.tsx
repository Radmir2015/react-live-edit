import React, { useEffect, useState } from "react";
import BaseTitle from "../Base/BaseTitle";

const stateKey = "title";

const LiveTitle = (props: {
  live: { subscribe: Function; dispatch: Function };
  disabled?: boolean;
}) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    props.live.subscribe(
      (_err: any, state: any) => stateKey in state && setTitle(state[stateKey])
    );
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTitle(event.target.value as string);
    props.live.dispatch({ [stateKey]: event.target.value });
  };

  return (
    <div>
      <BaseTitle
        title={title}
        handle={handleChange}
        disabled={props.disabled}
      />
    </div>
  );
};

export default LiveTitle;
