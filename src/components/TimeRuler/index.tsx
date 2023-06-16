import React, { useRef, useEffect } from "react";
import "./index.scss";

// 倍速
type velocityTypes = 1 | 1.25 | 1.5 | 1.75 | 2;

/**
 * 给定宽高，默认值，总值，自动生成刻度线，以及对应的刻度标记。
 * 根据大刻度间距，计算小刻度间距。
 */
interface TimeRulerProps {
  width: number;
  height: number;
  gap: number; // 长刻度线间隔
  longTickHeight: number; // 长刻度线线高
  shortTickHeight: number; // 短刻度线线高
  tickColor: string; // 刻度线颜色
  tickWidth: number; // 刻度线粗细
  tickFontSize: number; // 刻度标记字号
  tickFontColor: string; // 刻度标记颜色
  tickFontOffset?: number; // 刻度标记左偏移量
  borderBottom: string; // 底边样式
  background?: string; // 背景色
  defaultValue?: string; // 默认值
  total?: number; // 总值
  velocity?: velocityTypes; // 速率
}

/**
 * 1px = 1帧
 * 大刻度间距 = 小刻度间距 * 10
 * */
const mockProps = {
  width: 700,
  height: 30,
  longTickHeight: 20,
  shortTickHeight: 10,
  tickColor: "orange",
  tickFontColor: 'blue',
  tickWidth: 1,
  borderBottom: `1px solid black`,
  gap: 100,
};

const timeRulerStyle = (config: any) => {
  const {
    width,
    height,
    gap,
    longTickHeight,
    shortTickHeight,
    tickWidth,
    tickColor,
    background,
    borderBottom,
  } = config;

  return {
    height: `${height}px`,
    width: `${width}px`,
    background,
    backgroundImage: `repeating-linear-gradient(
      to right,
      ${tickColor} 0,
      ${tickColor} ${tickWidth}px,
      transparent 0,
      transparent ${gap}px
    ),
    repeating-linear-gradient(
      to right,
       ${tickColor} 0,
      ${tickColor} ${tickWidth}px,
       transparent 0,
      transparent ${gap / 10}px
    )`,
    backgroundSize: `100% ${longTickHeight}px, 100% ${shortTickHeight}px`,
    backgroundRepeat: `no-repeat`,
    backgroundPosition: `0 100%, 0 100%`,
    borderBottom,
  };
};

const getTickDom = (config: any) => {
  const {
    width,
    gap,
    shortTickHeight,
    tickFontSize,
    tickFontColor,
    tickFontOffset,
  } = config;
  const count = Math.floor(width / gap);

  const tickArr = [];
  for (let i = 0; i < count; i++) {
    tickArr.push({
      value: i * gap,
      style: {
        fontSize: tickFontSize,
        color: tickFontColor,
        top: `calc(100% - ${shortTickHeight}px)`,
        left: `${gap * i + tickFontOffset}px`,
        transform: "translateY(-100%)",
      },
    });
  }

  return (
    <>
      {tickArr.map((item) => (
        <div className="time-ruler-tick" style={item.style} key={item.value}>
          {item.value}
        </div>
      ))}
    </>
  );
};

/**
 * 鼠标拖动 , 获取光标相对于父容器左侧距离，动态修改 标尺的位置
 * 拖动时,tooltip位置跟随改变。
 * hover时，光标出显示tooltip
 * */
const getTickMarkDom = (config: any) => {
  const { longTickHeight } = config;
  const tickMarkRef = useRef(null);

  useEffect(() => {
    if(tickMarkRef?.current){
      // console.log(`offsetWidth`, tickMarkRef.current.offsetWidth);
    }
  }, []);

  const tickMarkStyle = {
    height: `${longTickHeight}px`,
    width: `10px`,
    background: "blue",
  };

  const handleMouseMove = (e: any) => {
    // console.log(`e`,e)
  };

  const handleMouseDown = (e: any) => {
    // let x = e.pageX - ball.offsetWidth / 2;
    // let y = e.pageY - ball.offsetHeight / 2;

    console.log(`e`, e);
    console.log(`tickMarkRef`, tickMarkRef);
  };

  return (
    <>
      <div
        className="time-ruler-tick-mark"
        ref={tickMarkRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        style={tickMarkStyle}
      ></div>
    </>
  );
};

const TimeRuler: React.FC<TimeRulerProps> = (props) => {
  // const { width , height , longTickHeight, shortTickHeight , tickColor, tickWidth , gap } = props;

  return (
    <div className="time-ruler-wrap">
      <div className="time-ruler-content" style={timeRulerStyle({ ...props })}>
        {/* 刻度标记 */}
        {getTickDom({ ...props })}

        {/* 刻度标尺 */}
        {getTickMarkDom({ ...props })}
      </div>
    </div>
  );
};

export default TimeRuler;
