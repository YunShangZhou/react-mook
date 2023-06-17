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
  height?: number;
  tickHeight: number; // 刻度线高
  tickColorOdd: string; // 刻度线颜色(奇数格)
  tickColorEven: string; // 刻度线颜色(偶数格)
  tickWidth: number; // 刻度线粗细
  markWidth?: number; // 标尺宽度
  markHeight?: number; // 标尺高度
  markBg?: string; // 标尺背景颜色
  markMiddleColor?: string; // 标尺中线颜色
  tipColor?: string; // 提示字体色
  tipFontSize?: string; // 提示字号
  tipBg?: string; // 提示背景色
  borderBottom?: string; // 底边样式
  background?: string; // 背景色
  defaultValue?: string; // 默认值
  total?: number; // 总值
  frameRate?: frameRateTypes; // 帧率
}

export const mockProps = {
  width: 700,
  // height: 30,
  tickHeight: 20,
  tickColorOdd: "#3F5770",
  tickColorEven: "#2F4459",
  tickWidth: 50,
  // markWidth: 25,
  markHeight: 20,
  markBg: `linear-gradient(to bottom , rgba(134, 142, 255, 0.53) , rgba(134, 142, 255, 0))`,
  markMiddleColor: "rgba(169, 175, 252, 0.53)",
  // background: 'blue',
  // borderBottom: `1px solid black`,
};

// 进度条样式
const timeBarStyle = (config: any) => {
  const {
    width,
    height,
    markHeight,
    tickHeight,
    tickWidth,
    tickColorOdd,
    tickColorEven,
    background,
    borderBottom,
  } = config;

  return {
    height: `${height || tickHeight + markHeight}px`,
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
  const markRef = useRef<HTMLDivElement>(null);
  const [markLeft, setMarkLeft] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 渲染 标尺dom
  const renderMarkDom = (config: any) => {
    const {
      tickWidth,
      tickHeight,
      markWidth,
      markHeight,
      markBg,
      markMiddleColor,
      tipColor,
      tipFontSize,
      tipBg,
    } = config;

    // 标记样式
    const markStyle = {
      height: `${markHeight || tickHeight}px`,
      width: `${markWidth || tickWidth}px`,
      background: markBg,
      // bottom: `${tickHeight}px`,
      bottom: 0,
      left: `${markLeft}px`,
    };

    // 中线样式
    const middleStyle = {
      backgroundColor: markMiddleColor,
    };

    // 提示样式
    const tipWidthScale = 0.8;
    const tipLeft = markLeft + (tickWidth * (1 - tipWidthScale)) / 2;
    const tipStyle = {
      fontSize: `${tipFontSize || 12}px`,
      color: `${tipColor || "white"}`,
      backgroundColor: `${tipBg || "rgba(63, 87, 112, 1)"}`,
      bottom: `${tickHeight}px`,
      left: `${tipLeft}px`,
      height: `${tickHeight}px`,
      width: `${tickWidth * tipWidthScale}px`,
    };

    const tipValue = Math.ceil(markLeft / (tickWidth));

    return (
      <>
        <div className="time-bar-mark" ref={markRef} style={markStyle}>
          <div className="time-bar-mark-middle" style={middleStyle}></div>
        </div>
        <div className="time-bar-mark-tip" style={tipStyle}>{tipValue || '1'}</div>
      </>
    );
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseDown = (e: any) => {
    setIsMouseDown(true);

    handleMouseEventForMark(
      e,
      contentRef.current as HTMLDivElement,
      markRef.current as HTMLDivElement,
      setMarkLeft
    );
  };

  const handleMouseMove = (e: any) => {
    if (!isMouseDown) return;

    handleMouseEventForMark(
      e,
      contentRef.current as HTMLDivElement,
      markRef.current as HTMLDivElement,
      setMarkLeft
    );
  };

  // 公共逻辑: 控制标记的鼠标事件。
  const handleMouseEventForMark = (
    e: any,
    contentRef: HTMLDivElement,
    markRef: HTMLDivElement,
    onSetMarkLeft: (pos: number) => void
  ) => {
    const { pageX: cursorLeft } = e;
    const { offsetLeft: contentLeft, offsetWidth: contentWidth } = contentRef;
    const { offsetWidth: markWidth, offsetLeft: markLeft } = markRef;
    const x = cursorLeft - contentLeft - markWidth / 2;

    // 左侧边界
    if (cursorLeft < contentLeft + markWidth / 2) return;

    // 右侧边界
    if (cursorLeft > contentLeft + (contentWidth - markWidth / 2)) return;

    onSetMarkLeft(x);
  };

  return (
    <div
      className="time-bar-content"
      ref={contentRef}
      style={timeBarStyle({ ...props })}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {renderMarkDom({ ...props, contentRef })}
    </div>
  );
};

export default TimeBar;
