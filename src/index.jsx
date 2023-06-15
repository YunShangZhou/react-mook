import React from "react";
import { createRoot } from 'react-dom/client';
import RouterInstance from "./routes";

import 'antd/dist/reset.css';
import "./style.scss";

// import ReactDOM from "react-dom";
// import App from "./App";

createRoot(document.getElementById("root")).render(RouterInstance);

// ReactDOM.render(<RouterComponent />, document.getElementById("root"));
