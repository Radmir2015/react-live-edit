import { render } from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import App from "./App";

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Switch>
      <Route path="/:roomId?" component={App} />
    </Switch>
  </BrowserRouter>,
  rootElement
);
