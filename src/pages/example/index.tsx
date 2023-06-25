import React, { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useSize } from 'ahooks';
import PlayerBar from '../../components/PlayerBar';
import styles from './index.module.css';

const cx = classNames.bind(styles);

/**
 * 不要给包裹控制器的父元素添加padding, useSize计算的宽度会一并带上padding值。
 */
const PlayerBarExamplePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  const [value, setValue] = useState<number>(30);
  const [total, setTotal] = useState<number>(60);
  const [frameRate, setFrameRate] = useState<number>(26);

  return (
    <div
      ref={containerRef}
      className={cx('example-page')}
      style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
      <span>{size?.width}</span>
      <PlayerBar
        parentWidth={size?.width as number}
        // {...requiredDefaultProps}
        frameIndex={value}
        frameTotal={total}
        frameRate={frameRate}
        onSetFrameIndex={setValue}
        onSetFrameTotal={setTotal}
        onSetFrameRate={setFrameRate}
      />
      <PlayerBar
        parentWidth={size?.width as number}
        // {...requiredDefaultProps}
        frameMode="multiple"
        frameIndex={value}
        frameTotal={total}
        frameRate={frameRate}
        onSetFrameIndex={setValue}
        onSetFrameTotal={setTotal}
        onSetFrameRate={setFrameRate}
      />
    </div>
  );
};

export default PlayerBarExamplePage;
