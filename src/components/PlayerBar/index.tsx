import React, { useEffect, useRef, useState } from "react";
import { Button, Select, Dropdown, Space, InputNumber, Divider } from "antd";
import { CaretDownOutlined, DownOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const frameOptions = [12, 18, 24, 30, 36, 48, 72];
type frameOptionsType = 12 | 18 | 24 | 30 | 36 | 48 | 72;

// 帧数模式
type frameModeTypes = "single" | "multiple" | undefined;

/**
 * 多帧模式: 一格将代表若干帧
 */
interface PlayerBarProps {
  defaultValue: number; // 默认值
  total: number; // 总值
  width: number;
  frameMode?: frameModeTypes; // 帧率模式
  splitCount: number; // 多帧模式下的格子数量
  frameRate?: frameOptionsType; // 帧率
  height?: number;
  tickHeight: number; // 刻度线高
  tickColorOdd: string; // 刻度线颜色(奇数格)
  tickColorEven: string; // 刻度线颜色(偶数格)
  tickWidth?: number; // 刻度线粗细(废弃，可根据width / top 自生成)
  markHeight?: number; // 标尺高度
  markBg?: string; // 标尺背景颜色
  markMiddleColor?: string; // 标尺中线颜色
  markMiddleWidth: number; // 标尺中线宽度
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
}

export const mockProps = {
  total: 60,
  defaultValue: 20,
  splitCount: 5,
  frameMode: "single" as frameModeTypes,
  frameRate: 72 as frameOptionsType,
  width: 700,
  // height: 30,
  tickHeight: 20,
  tickColorOdd: "#3F5770",
  tickColorEven: "#2F4459",
  // tickWidth: 10,
  tipWidth: 50,
  tailWidth: 100,
  tailColor: "#707AFF",
  tailBgColor: "#16213E",
  tailFontSize: 14,
  markHeight: 20,
  markBg: `linear-gradient(to bottom , rgba(134, 142, 255, 0.53) , rgba(134, 142, 255, 0))`,
  markMiddleColor: "rgba(169, 175, 252, 0.53)",
  markMiddleWidth: 1,
  // background: 'blue',
  // borderBottom: `1px solid black`,
};

// 进度条样式
const playerBarStyle = (config: any) => {
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
const playerBarTailStyle = (config: any) => {
  const { tailBgColor, tailColor, tailFontSize, tailWidth, tickHeight } =
    config;

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
    currentTotal,
    splitCount = 20,
  } = config;

  // 标记样式
  const markStyle = () => {
    const style = {
      height: `${markHeight || tickHeight}px`,
      width: `${tickWidth}px`,
      background: markBg,
      // bottom: `${tickHeight}px`,
      bottom: 0,
      left: `${markLeft}px`,
    };

    if (frameMode === "multiple") {
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
    let tipLeft = markLeft - tipWidth / 2 + tickWidth / 2;
    if (frameMode === "multiple") {
      tipLeft = markLeft - tipWidth / 2 + markMiddleWidth / 2;
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

  const tipValue = calculateCurrentFrame({
    markLeft,
    tickWidth,
    splitCount,
    frameMode,
    currentTotal,
  });

  return (
    <>
      <div className={cx("player-bar-mark")} ref={markRef} style={markStyle()}>
        <div className={cx("player-bar-mark-middle")} style={middleStyle} />
      </div>
      <div className={cx("player-bar-mark-tip")} style={tipStyle()}>
        {tipValue || "1"}
      </div>
    </>
  );
};

// 根据当前帧数计算标尺左侧距离
const calculateMarkLeft = (config: any) => {
  const {
    frameMode,
    currentTotal,
    splitCount,
    width,
    tickWidth,
    currentFrame,
    markMiddleWidth,
  } = config;

  let markLeft;
  markLeft = (currentFrame - 1) * tickWidth;
  if (frameMode === "multiple") {
    const scale = splitCount / currentTotal;

    if (currentFrame === currentTotal) {
      markLeft = width - markMiddleWidth;
    }
    markLeft = (currentFrame - 1) * (tickWidth * scale);
  }

  return markLeft;
};

// 根据标尺左侧距离計算当前帧数
const calculateCurrentFrame = (config: any) => {
  const { markLeft, frameMode, splitCount, currentTotal, tickWidth } = config;
  let currentFrame;

  currentFrame = Math.ceil((markLeft + 1) / tickWidth);
  if (frameMode === "multiple") {
    const scale = splitCount / currentTotal;
    currentFrame = Math.ceil((markLeft + 1) / (tickWidth * scale));
  }

  return currentFrame;
};

const PlayerBar: React.FC<PlayerBarProps> = (props) => {
  const {
    total,
    defaultValue,
    splitCount = 20,
    width,
    frameMode: fm,
    markMiddleWidth,
    frameRate = 24,
  } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [frameMode, setFrameMode] = useState<frameModeTypes>(fm);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentFrameRate, setCurrentFrameRate] = useState(frameRate as number);

  const [currentTotal, setCurrentTotal] = useState(total);
  const [currentFrame, setCurrentFrame] = useState(defaultValue);

  const [frameRateInput, setFrameRateInput] = useState<number | null>(null);
  const [frameTotalInput, setFrameTotalInput] = useState<number | null>(null);
  const [frameCurrentInput, setFrameCurrentInput] = useState<number | null>(
    null
  );

  let tickWidth = width / currentTotal;
  if (frameMode === "multiple") tickWidth = Math.ceil(width / splitCount);

  const [markLeft, setMarkLeft] = useState(
    calculateMarkLeft({
      currentFrame,
      tickWidth,
      splitCount,
      frameMode,
      currentTotal,
      markMiddleWidth,
      width,
    })
  );

  // 帧数 | 总帧数 改变时，标尺位置变化
  useEffect(() => {
    if (currentTotal < currentFrame) {
      setCurrentFrame(currentTotal);
      return;
    }
    setMarkLeft(
      calculateMarkLeft({
        currentFrame,
        tickWidth,
        splitCount,
        frameMode,
        currentTotal,
        markMiddleWidth,
        width,
      })
    );
  }, [currentFrame, currentTotal]);

  // 帧数 | 总帧数 改变时，标尺位置变化
  useEffect(() => {
    if (currentFrameRate == frameRate) {
      return;
    }
    handlePause();
    handlePlay();
  }, [currentFrameRate]);

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
      onSetMarkLeft: setMarkLeft,
      mode: "down",
      frameMode,
      tickWidth,
      markMiddleWidth,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isMouseDown) return;

    handleMouseEventForMark({
      e,
      contentRef: contentRef.current as HTMLDivElement,
      onSetMarkLeft: setMarkLeft,
      mode: "move",
      frameMode,
      tickWidth,
      markMiddleWidth,
    });
  };

  // 公共逻辑: 控制标记的鼠标事件。
  const handleMouseEventForMark = (config: any) => {
    const {
      e,
      contentRef,
      tickWidth,
      onSetMarkLeft,
      mode,
      frameMode,
      markMiddleWidth,
    } = config;
    const { pageX: cursorLeft } = e;
    const { offsetLeft: contentLeft, offsetWidth: contentWidth } = contentRef;

    let markWidth = frameMode === "single" ? tickWidth : markMiddleWidth;
    let offsetLeft = cursorLeft - contentLeft - markWidth / 2;

    const isOverflowLeft = cursorLeft < contentLeft + markWidth / 2;
    const isOverflowRight =
      cursorLeft > contentLeft + (contentWidth - markWidth / 2);

    // 边界处理
    switch (mode) {
      case "move":
        if (isOverflowLeft || isOverflowRight) return;
      case "down":
        if (isOverflowLeft) return onSetMarkLeft(0);
        if (isOverflowRight) return onSetMarkLeft(contentWidth - markWidth);
    }

    // 单帧 模式
    if (frameMode === "single") {
      offsetLeft = cursorLeft - contentLeft;
      const offsetCount = Math.floor(offsetLeft / markWidth);

      offsetLeft = offsetCount * markWidth;
    }

    onSetMarkLeft(offsetLeft);
  };

  const playSetTimeoutFnId = useRef<any>();

  /**
   * setTimeout最小间隔为4ms
   * 目前帧数99，对应倍速4.125
   * / 1000 * 20 ：计算每20ms宽度。
   * */
  const multiple = currentFrameRate / frameRate;
  const gap = 20 / multiple;
  const gapWidth =
    ((frameMode === "multiple"
      ? (currentFrameRate * tickWidth * splitCount) / currentTotal
      : currentFrameRate * tickWidth) /
      1000) *
    20;

  const handlePlay = () => {
    if (playSetTimeoutFnId.current) return;

    playSetTimeoutFnId.current = setInterval(() => {
      setMarkLeft((prev) => {
        if (prev >= width - gapWidth) return 0;
        return prev + gapWidth;
      });
    }, gap);
  };

  const handlePause = () => {
    clearTimeout(playSetTimeoutFnId.current);
    playSetTimeoutFnId.current = null;
  };

  // 一帧的宽度
  let frameWidth = tickWidth;
  if (frameMode === "multiple") {
    const scale = splitCount / currentTotal;
    frameWidth = tickWidth * scale;
  }
  const handlePrev = () => {
    setMarkLeft((prev) => {
      if (prev - frameWidth < 0) {
        return 0;
      }
      return prev - frameWidth;
    });
  };

  const handleNext = () => {
    setMarkLeft((prev) => {
      if (prev + frameWidth >= width) {
        return (
          width - (frameMode === "multiple" ? markMiddleWidth : frameWidth)
        );
      }
      return prev + frameWidth;
    });
  };

  const handleLeftmost = () => {
    setMarkLeft(0);
  };

  const handleRightmost = () => {
    if (frameMode === "single") {
      return setMarkLeft(width - tickWidth);
    }
    setMarkLeft(width - markMiddleWidth);
  };

  // 帧率 input
  const handleframeRateInputChange = (value: number | null) => {
    setFrameRateInput(value as number);
  };

  // 总帧数 input
  const handleframeTotalInputChange = (value: number | null) => {
    setFrameTotalInput(value as number);
  };

  // 当前帧数 input
  const handleframeCurrentInputChange = (value: number | null) => {
    setFrameCurrentInput(value as number);
  };

  // input赋值前做处理
  const handleBeforeConfirm = (config: any) => {
    const { value, min, fn } = config;
    if (value === null || value === undefined) return;
    if (value < min) return;

    fn(value);
  };

  return (
    <div className={cx("player-bar")}>
      <div className={cx("player-bar-setting")}>
        <div className={cx("player-bar-setting-item")}>
          <span>设置总帧数:</span>
          <InputNumber
            style={{ width: "200px" }}
            controls={false}
            value={frameTotalInput}
            onChange={handleframeTotalInputChange}
            placeholder="请输入总帧数"
            min={1}
            onPressEnter={() =>
              handleBeforeConfirm({
                fn: setCurrentTotal,
                value: frameTotalInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: setCurrentTotal,
                value: frameTotalInput,
                min: 1,
              })
            }
          >
            确定
          </Button>
        </div>

        <div className={cx("player-bar-setting-item")}>
          <span>设置当前帧数:</span>
          <InputNumber
            style={{ width: "200px" }}
            controls={false}
            value={frameCurrentInput}
            required
            onChange={handleframeCurrentInputChange}
            placeholder="请输入当前帧数"
            min={1}
            max={currentTotal}
            onPressEnter={() =>
              handleBeforeConfirm({
                fn: setCurrentFrame,
                value: frameCurrentInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: setCurrentFrame,
                value: frameCurrentInput,
                min: 1,
              })
            }
          >
            确定
          </Button>
        </div>
      </div>
      {/* info */}
      <div className={cx("player-bar-info")}>
        <span>模式: {frameMode === "multiple" ? "多帧模式" : "单帧模式"}</span>
        <span>fps: {currentFrameRate}</span>
        <span>倍速: {(currentFrameRate / 24).toFixed(2)}x</span>
        <span>
          当前帧数:{" "}
          {calculateCurrentFrame({
            markLeft,
            tickWidth,
            splitCount,
            frameMode,
            currentTotal,
          })}
        </span>
      </div>
      <div className={cx("player-bar-show")}>
        {/* content */}
        <div
          className={cx("player-bar-content")}
          ref={contentRef}
          style={playerBarStyle({ ...props, tickWidth })}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {renderMarkDom({
            ...props,
            contentRef,
            frameMode,
            markLeft,
            markRef,
            tickWidth,
            currentFrame,
            currentTotal,
          })}
        </div>
        {/* tail */}
        <div
          className={cx("player-bar-tail")}
          style={playerBarTailStyle({ ...props })}
        >
          {currentTotal}
        </div>
      </div>
      <div className={cx("player-bar-control")}>
        <Button type="link" onClick={handlePrev}>{`<<`}</Button>
        <Button type="link" onClick={handlePlay}>
          播放
        </Button>
        <Button type="link" onClick={handlePause}>
          暂停
        </Button>
        <Button type="link" onClick={handleNext}>{`>>`}</Button>
        <Button type="link" onClick={handleLeftmost}>{`|<`}</Button>
        <Button type="link" onClick={handleRightmost}>{`>|`}</Button>
        <Button type="link"></Button>
        <Select
          // onChange={handleChange}
          defaultValue="frame"
          suffixIcon={<CaretDownOutlined />}
          style={{ width: 120 }}
          options={[
            {
              value: "frame",
              label: `${calculateCurrentFrame({
                markLeft,
                tickWidth,
                splitCount,
                frameMode,
                currentTotal,
              })}/${currentTotal}`,
            },
            { value: "time", label: "12:12" },
          ]}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Dropdown
          destroyPopupOnHide
          trigger={["click"]}
          overlayStyle={{ padding: 0 }}
          overlayClassName={cx("frame-dropdown")}
          open={dropdownOpen}
          dropdownRender={() => {
            return (
              <>
                <div className={cx("frame-dropdown-header")}>
                  <span className={cx("key")}>帧率</span>
                  <span className={cx("value")}>倍率</span>
                </div>
                <div className={cx("frame-dropdown-content")}>
                  {frameOptions.map((fps, index) => {
                    return (
                      <div
                        key={index}
                        className={cx(
                          "frame-dropdown-content-item",
                          `${
                            fps === currentFrameRate &&
                            "frame-dropdown-content-item--active"
                          }`
                        )}
                        onClick={() => {
                          setCurrentFrameRate(fps);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className={cx("key")}>{`${fps}fps`} </span>
                        <span className={cx("value")}>{`${fps / 24}x`}</span>
                        {fps === frameRate && <span>原始帧率</span>}
                      </div>
                    );
                  })}
                </div>
                <Divider style={{ marginBlock: "4px 0" }} />
                <div className={cx("frame-dropdown-footer")}>
                  <InputNumber
                    style={{ flex: 1 }}
                    controls={false}
                    value={frameRateInput}
                    onChange={handleframeRateInputChange}
                    min={1}
                    max={99}
                    placeholder="自定义帧率"
                    onPressEnter={() => {
                      handleBeforeConfirm({
                        fn: setCurrentFrameRate,
                        value: frameRateInput,
                        min: 1,
                      });
                      setDropdownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.keyCode === 27) setDropdownOpen(false);
                    }}
                    autoFocus
                  />
                  <Button
                    type="link"
                    style={{ color: "rgba(126, 135, 255, 1)" }}
                    onClick={() => {
                      handleBeforeConfirm({
                        fn: setCurrentFrameRate,
                        value: frameRateInput,
                        min: 1,
                      });
                      setDropdownOpen(false);
                    }}
                  >
                    确定
                  </Button>
                </div>
              </>
            );
          }}
        >
          <a onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Space>
              选择帧率
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
    </div>
  );
};

export default PlayerBar;
