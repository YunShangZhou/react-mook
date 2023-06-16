import React, { useRef, useEffect, useState, MouseEventHandler } from "react";
import "./index.scss";

// 帧率
type frameRateTypes = 12 | 18 | 24 | 30 | 36 | 48 | 72;

/**
 * 给定宽高，默认值，总值，自动生成刻度线，以及对应的刻度标记。
 * 根据大刻度间距，计算小刻度间距。
 */
interface TimeBarProps {
  width: number;
  height: number;
  tickHeight: number; // 刻度线高
  tickColorOdd: string; // 刻度线颜色(奇数格)
  tickColorEven: string; // 刻度线颜色(偶数格)
  tickWidth: number; // 刻度线粗细
  borderBottom: string; // 底边样式
  background?: string; // 背景色
  defaultValue?: string; // 默认值
  total?: number; // 总值
  frameRate?: frameRateTypes; // 帧率
}

export const mockProps = {
  width: 700,
  height: 30,
  tickHeight: 20,
  tickColorOdd: "#3F5770",
  tickColorEven: "#2F4459",
  tickWidth: 50,
  // background: 'blue',
  borderBottom: `1px solid black`,
};

const timeBarStyle = (config: any) => {
  const {
    width,
    height,
    tickHeight,
    tickWidth,
    tickColorOdd,
    tickColorEven,
    background,
    borderBottom,
  } = config;

  return {
    height: `${height}px`,
    width: `${width}px`,
    background,
    backgroundImage: `repeating-linear-gradient(
      to right,
      ${tickColorOdd} 0,
      ${tickColorOdd} ${tickWidth}px,
      ${tickColorEven} ${tickWidth}px,
      ${tickColorEven} ${tickWidth * 2}px
    )`,
    backgroundSize: `100% ${tickHeight}px`,
    backgroundRepeat: `no-repeat`,
    backgroundPosition: `0 100%, 0 100%`,
    borderBottom,
  };
};

/**
 * 鼠标拖动 , 获取光标相对于父容器左侧距离，动态修改 标尺的位置
 * 拖动时,tooltip位置跟随改变。
 * hover时，光标出显示tooltip
 * */

const TimeBar: React.FC<TimeBarProps> = (props) => {
  // const { width , height , tickHeight , tickColor, tickWidth  } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [markLeft, setMarkLeft] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const getmarkDom = (config: any) => {
    const { tickHeight } = config;

    useEffect(() => {}, []);

    const markStyle = {
      height: `${tickHeight}px`,
      width: `10px`,
      background: "blue",
      bottom: `${tickHeight}px`,
      left: `${markLeft}px`,
    };

    return (
      <>
        <div className="time-bar-mark" style={markStyle}></div>
      </>
    );
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseDown = (e: any) => {
    setIsMouseDown(true);
    const { offsetLeft } = contentRef.current as HTMLDivElement;
    const x = e.pageX - offsetLeft;
    setMarkLeft(x);
  };

  const handleMouseMove = (e: any) => {
    if (!isMouseDown) return;

    const { offsetLeft } = contentRef.current as HTMLDivElement;
    const x = e.pageX - offsetLeft;
    setMarkLeft(x);
  };

  return (
    <div className="time-bar-wrap">
      <div
        className="time-bar-content"
        ref={contentRef}
        style={timeBarStyle({ ...props })}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 刻度标尺 */}
        {getmarkDom({ ...props, contentRef })}
      </div>
    </div>
  );
};

export default TimeBar;
