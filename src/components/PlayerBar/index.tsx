import React, { useRef, useEffect } from "react";
import "./index.scss";

// 帧率
type frameRateTypes = 12 | 18 | 24 | 30 | 36 | 48 | 72;

interface PlayerBarProps {
  width: number;
  height: number;
  total: number; // 总值
  oddColor?: string;  // 奇数格颜色
  evenColor?: string; // 偶数格颜色
  hoverColor?: string; // 普通hover背景色
  markHoverColor?: string; // 标注hover背景色
  selectedVerticalColor?: string; // 选中纵轴色
  selectedBorderTopColor?: string; // 选中顶边色
  defaultValue?: string; // 默认值
  background?: string; // 背景色
  frameRate?: frameRateTypes; // 速率
}

const playerBarStyle = (config: any) => {
  const { width, height } = config;

  return {
    height: `${height}px`,
    width: `${width}px`,
  };
};

/**
 * 鼠标拖动 , 获取光标相对于父容器左侧距离，动态修改 标尺的位置
 * 拖动时,tooltip位置跟随改变。
 * hover时，光标出显示tooltip
 * */
const getSelectedDom = (config: any) => {
  const { longTickHeight } = config;
  const selectedBlockRef = useRef(null);

  useEffect(() => {
    if (selectedBlockRef?.current) {
      // console.log(`offsetWidth`, selectedBlockRef.current.offsetWidth);
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
    console.log(`selectedBlockRef`, selectedBlockRef);
  };

  return (
    <>
      <div
        className="player-bar-tick-mark"
        ref={selectedBlockRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        style={tickMarkStyle}
      ></div>
    </>
  );
};

const PlayerBar: React.FC<PlayerBarProps> = (props) => {
  // const { width , height , longTickHeight, shortTickHeight , tickColor, tickWidth  } = props;
  const { width, total } = props;

  const cellWidth = Math.floor(width / total); // 单个格子宽度
  

  return (
    <div className="player-bar-wrap">
      <div className="player-bar-content" style={playerBarStyle({ ...props })}>
        {new Array(total).map((_, index) => {
          return <div key={index} className="player-bar-cell"></div>;
        })}
      </div>
    </div>
  );
};

export default PlayerBar;
