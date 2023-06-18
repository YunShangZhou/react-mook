import React, {
  useRef, useEffect, useState, MouseEventHandler,
} from "react";
import "./index.scss";

// 帧率
type frameRateTypes = 12 | 18 | 24 | 30 | 36 | 48 | 72;

// 帧数模式
type frameModeTypes = 'single' | 'multiple';

/**
 * 多帧模式: 一格将代表若干帧
 */
interface TimeBarProps {
  width: number;
  height?: number;
  tickHeight: number; // 刻度线高
  tickColorOdd: string; // 刻度线颜色(奇数格)
  tickColorEven: string; // 刻度线颜色(偶数格)
  tickWidth?: number; // 刻度线粗细(废弃，可根据width / top 自生成)
  markWidth?: number; // 标尺宽度
  markHeight?: number; // 标尺高度
  markBg?: string; // 标尺背景颜色
  markMiddleColor?: string; // 标尺中线颜色
  markMiddleWidth?: number; // 标尺中线宽度
  tipColor?: string; // 提示字体色
  tipFontSize?: string; // 提示字号
  tipBg?: string; // 提示背景色
  tipWidth?: number; // 提示宽度
  tailWidth?: number; // 尾部宽度
  tailColor?: string; // 尾部字体色
  tailBgColor?: string; // 尾部背景色
  tailFontSize?: number; // 尾部字号
  borderBottom?: string; // 底边样式
  background?: string; // 背景色
  defaultValue?: string; // 默认值
  total: number; // 总值
  frameMax?: number; // 最大帧数(超过范围，将会自动切换成多帧模式)
  frameRate?: frameRateTypes; // 帧率
  splitCount?: number; // 多帧模式下的格子数量
}

export const mockProps = {
  total: 60,
  frameMax: 50,
  splitCount: 5,
  width: 700,
  // height: 30,
  tickHeight: 20,
  tickColorOdd: "#3F5770",
  tickColorEven: "#2F4459",
  // tickWidth: 10,
  tipWidth: 50,
  tailWidth: 100,
  tailColor: '#707AFF',
  tailBgColor: '#16213E',
  tailFontSize: 14,
  // markWidth: 25,
  markHeight: 20,
  markBg: `linear-gradient(to bottom , rgba(134, 142, 255, 0.53) , rgba(134, 142, 255, 0))`,
  markMiddleColor: "rgba(169, 175, 252, 0.53)",
  markMiddleWidth: 5,
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

// 尾缀样式
const timeBarTailStyle = (config: any) => {
  const {
    tailBgColor, tailColor, tailFontSize, tailWidth, tickHeight,
  } = config;

  return {
    color: tailColor,
    backgroundColor: tailBgColor,
    fontSize: `${tailFontSize}px`,
    width: `${tailWidth}px`,
    height: `${tickHeight}px`,
  };
};

// 渲染 标尺dom
const renderMarkDom = (config: any) => {
  const {
    tickWidth,
    tickHeight,
    markHeight,
    markWidth,
    markBg,
    markMiddleColor,
    markMiddleWidth,
    markLeft,
    tipColor,
    tipFontSize,
    tipBg,
    tipWidth,
    markRef,
    frameMode,
    total,
    splitCount = 20,
  } = config;

  // 标记样式
  const markStyle = () => {
    const style = {
      height: `${markHeight || tickHeight}px`,
      width: `${markWidth || tickWidth}px`,
      background: markBg,
      // bottom: `${tickHeight}px`,
      bottom: 0,
      left: `${markLeft}px`,
    };

    if (frameMode === 'multiple') {
      Object.assign(style, { width: `${markMiddleWidth}px` });
    }

    return style;
  };

  // 中线样式
  const middleStyle = {
    width: `${markMiddleWidth}px`,
    backgroundColor: markMiddleColor,
  };

  // 提示样式
  const tipStyle = () => {
    let tipLeft = markLeft - tipWidth / 2 + (markWidth || tickWidth) / 2;
    if (frameMode === 'multiple') {
      tipLeft = markLeft - tipWidth / 2 + (markMiddleWidth / 2);
    }

    return {
      fontSize: `${tipFontSize || 12}px`,
      color: `${tipColor || "white"}`,
      backgroundColor: `${tipBg || "rgba(63, 87, 112, 1)"}`,
      bottom: `${tickHeight}px`,
      left: `${tipLeft}px`,
      height: `${tickHeight}px`,
      width: `${tipWidth}px`,
    };
  };

  // +1是因为markLeft为上一次的左侧间距,因此需要弥补。
  let tipValue = Math.ceil((markLeft + 1) / tickWidth);
  if (frameMode === 'multiple') {
    const scale = splitCount / total;
    tipValue = Math.ceil((markLeft + 1) / (tickWidth * scale));
  }

  return (
    <>
      <div className="time-bar-mark" ref={markRef} style={markStyle()}>
        <div className="time-bar-mark-middle" style={middleStyle} />
      </div>
      <div className="time-bar-mark-tip" style={tipStyle()}>
        {tipValue || "1"}
      </div>
    </>
  );
};

const TimeBar: React.FC<TimeBarProps> = (props) => {
  const {
    total, frameMax, splitCount = 20, width,
  } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [markLeft, setMarkLeft] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  let tickWidth = width / total;
  let frameMode: frameModeTypes = 'single';
  if (frameMax && total > frameMax) {
    frameMode = "multiple";
    tickWidth = width / splitCount;
  }

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseDown = (e: any) => {
    setIsMouseDown(true);

    handleMouseEventForMark({
      e,
      contentRef: contentRef.current as HTMLDivElement,
      markRef: markRef.current as HTMLDivElement,
      onSetMarkLeft: setMarkLeft,
      mode: "down",
      frameMode,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isMouseDown) return;

    handleMouseEventForMark({
      e,
      contentRef: contentRef.current as HTMLDivElement,
      markRef: markRef.current as HTMLDivElement,
      onSetMarkLeft: setMarkLeft,
      mode: "move",
      frameMode,
    });
  };

  // 公共逻辑: 控制标记的鼠标事件。
  const handleMouseEventForMark = (config: any) => {
    const {
      e, contentRef, markRef, onSetMarkLeft, mode, frameMode,
    } = config;
    const { pageX: cursorLeft } = e;
    const { offsetLeft: contentLeft, offsetWidth: contentWidth } = contentRef;
    const { offsetWidth: markWidth, offsetLeft: markLeft } = markRef;
    let offsetLeft = cursorLeft - contentLeft - markWidth / 2;

    const isOverflowLeft = cursorLeft < contentLeft + markWidth / 2;
    const isOverflowRight = cursorLeft > contentLeft + (contentWidth - markWidth / 2);

    // 边界处理
    switch (mode) {
      case "move":
        if (isOverflowLeft || isOverflowRight) return;
      case "down":
        if (isOverflowLeft) return onSetMarkLeft(0);
        if (isOverflowRight) return onSetMarkLeft(contentWidth - markWidth);
    }

    // 一格/一帧 模式
    if (frameMode === "single") {
      offsetLeft = cursorLeft - contentLeft;
      const offsetCount = Math.floor(offsetLeft / markWidth);

      offsetLeft = offsetCount * markWidth;
    }

    onSetMarkLeft(offsetLeft);
  };

  return (
    <div className="time-bar">
      <div
        className="time-bar-content"
        ref={contentRef}
        style={timeBarStyle({ ...props, tickWidth })}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {renderMarkDom({
          ...props, contentRef, frameMode, markLeft, markRef, tickWidth,
        })}
      </div>
      <div className="time-bar-tail" style={timeBarTailStyle({ ...props })}>
        {total}
      </div>
    </div>
  );
};

export default TimeBar;
