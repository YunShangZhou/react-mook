import React, { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useSize } from 'ahooks';
import { Button } from 'antd';
import PlayerBar, { requiredDefaultProps } from '../../components/PlayerBar';
import styles from './index.module.css';

const cx = classNames.bind(styles);

/**
 * 不要给包裹控制器的父元素添加padding, useSize计算的宽度会一并带上padding值。
 */
const ExamplePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  const [value, setValue] = useState(30);

  const handleClick = () => {
    setValue(prev => prev + 5);
    // console.log(`defaultValue`,defaultValue)
  };

  const handleSeekToFrame = (frameIndex:number) => {
    setValue(frameIndex);
  };

  const handlePlayerBarStart = ()=>{
    console.log(`The start callback of the player-bar`)
  }

  const handlePlayerBarPause = ()=>{
    console.log(`The paused callback of the player-bar`)
  }

  const handlePlayerBarLoad = ()=>{
    console.log(`The load callback of the player-bar`)
  }

  return (
    <div
      ref={containerRef}
      className={cx('example-page')}
      style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
      <span>{size?.width}</span>
      <PlayerBar
        parentWidth={size?.width as number}
        {...requiredDefaultProps}
        value={value}
        seekToFrame={handleSeekToFrame}
        onStart={handlePlayerBarStart}
        onPause={handlePlayerBarPause}
        onLoad={handlePlayerBarLoad}
        onSetValue = {setValue}
      />
      {/* <PlayerBar
        parentWidth={size?.width as number}
        {...requiredDefaultProps}
        frameMode="multiple"
      /> */}
      <Button onClick={handleClick}>帧数+5</Button>
    </div>
  );
};

export default ExamplePage;
