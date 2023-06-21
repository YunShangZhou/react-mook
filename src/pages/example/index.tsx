import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import { useSize } from 'ahooks';
import PlayerBar, { requiredDefaultProps } from '../../components/PlayerBar';
import styles from './index.module.css';


const cx = classNames.bind(styles);

/**
 * 不要给包裹控制器的父元素添加padding, useSize计算的宽度会一并带上padding值。
 */
const ExamplePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div
      ref={containerRef}
      className={cx('example-page')}
      style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
      <span>{size?.width}</span>
      <PlayerBar parentWidth={size?.width as number} {...requiredDefaultProps} />
      {/* <PlayerBar
        parentWidth={size?.width as number}
        {...requiredDefaultProps}
        frameMode="multiple"
      /> */}
    </div>
  );
};

export default ExamplePage;
