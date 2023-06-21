import React, { useEffect, useRef } from "react";
import classNames from "classnames/bind";
import PlayerBar, { requiredDefaultProps } from "../../components/PlayerBar";
import styles from "./index.module.css";

import { useSize } from "ahooks";

const cx = classNames.bind(styles);

const ExamplePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div
      ref={containerRef}
      className={cx("example-page")}
      style={{ display: "flex", flexDirection: "column", gap: 50 }}
    >
      <span>{size?.width}</span>
      <PlayerBar
        parentWidth={size?.width as number}
        {...requiredDefaultProps}
      />
      <PlayerBar
        parentWidth={size?.width as number}
        {...requiredDefaultProps}
        frameMode="multiple"
      />
    </div>
  );
};

export default ExamplePage;
