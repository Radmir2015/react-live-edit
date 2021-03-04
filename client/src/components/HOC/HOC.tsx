import React, { useEffect, useState } from "react";
import { IHOCPropsType } from "./IHOC";

const LiveHOC = ({
  component: Component,
  stateKey,
  live,
  ...rest
}: {
  component: React.FC<IHOCPropsType>;
  stateKey: string;
  live: { dispatch: Function; subscribe: Function };
  [x: string]: any;
}) => {
  const [data, setData] = useState("");

  useEffect(() => {
    live.subscribe(
      (_err: any, state: any) => stateKey in state && setData(state[stateKey])
    );
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setData(event.target.value as string);
    live.dispatch({ [stateKey]: event.target.value });
  };

  return <Component {...rest} value={data} onChange={handleChange} />;
};

export default LiveHOC;
