import React from "react";

export interface IHOCPropsType {
  value: string;
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  children?: React.ReactNode;
}
