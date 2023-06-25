import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, Dropdown, Space, InputNumber, Divider } from 'antd';
import { CaretDownOutlined, DownOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './index.module.css';

const cx = classNames.bind(styles);

const frameOptions = [12, 18, 24, 30, 36, 48, 72];
type frameOptionsType = 12 | 18 | 24 | 30 | 36 | 48 | 72;

// 帧数模式
type frameModeTypes = 'single' | 'multiple' | undefined;

interface PlayerBarCallbackProps {
  onSetValue: (frameIndex: any) => void;
  onSetTotal: (total: any) => void;
  onSetFrameRate: (frameRate: any) => void;
  onLoad?: () => void;
  onStart?: (loop: boolean) => void;
  onPause?: () => void;
  onPlaybackRateChange?: () => void;
  seekToFrame?: (frameIndex: number) => void;
  onTotalChange?: (total: number) => void;
  onFrameRateChange?: (frameRate: number) => void;
}

interface PlayerBarOriginalProps {
  value: number; // 默认值
  total: number; // 总值
  frameRate: number; // 帧率
  originalFrameRate?: frameOptionsType; // 原始帧率
  splitCount?: number; // 多帧模式下的格子数量
  frameMode?: frameModeTypes; // 帧率模式: 单帧(格/帧) | 多帧(格/n帧)
  height?: number;
  tickHeight?: number; // 刻度线高
  tickColorOdd?: string; // 刻度线颜色(奇数格)
  tickColorEven?: string; // 刻度线颜色(偶数格)
  markBg?: string; // 标尺背景颜色
  markMiddleColor?: string; // 标尺中线颜色
  markMiddleWidth?: number; // 标尺中线宽度
  tipColor?: string; // 提示字体色
  tipFontSize?: string; // 提示字号
  tipBg?: string; // 提示背景色
  tipWidth?: number; // 提示宽度
  tailWidthPercent?: number; // 尾部宽度(百分比)
  tailColor?: string; // 尾部字体色
  tailBgColor?: string; // 尾部背景色
  tailFontSize?: number; // 尾部字号
  parentWidth: number; // 父元素宽度
}

type PlayerBarProps = PlayerBarCallbackProps & PlayerBarOriginalProps;

// 必填属性
export const requiredDefaultProps = {
  total: 60,
  value: 20,
  frameRate: 48,
};

// 选填属性
export const optionalDefaultProps = {
  // width: '100%',
  splitCount: 20,
  frameMode: 'single' as frameModeTypes,
  originalFrameRate: 24,
  height: 120,
  tickHeight: 20,
  tickColorOdd: '#3F5770',
  tickColorEven: '#2F4459',
  tipWidth: 50,
  tipFontSize: 12,
  tipColor: 'white',
  tipBg: 'rgba(63, 87, 112, 1)',
  tailWidthPercent: 10,
  tailColor: '#707AFF',
  tailBgColor: '#16213E',
  tailFontSize: 14,
  markBg: `linear-gradient(to bottom , rgba(134, 142, 255, 0.53) , rgba(134, 142, 255, 0))`,
  markMiddleColor: 'rgba(169, 175, 252, 0.53)',
  markMiddleWidth: 1,
  onLoad: () => {},
  onStart: (loop = false) => {},
  onPause: () => {},
  onPlaybackRateChange: () => {},
  seekToFrame: (frameIndex: number) => {},
  onTotalChange: () => {},
  onFrameRateChange: () => {},
};

// 默认属性
export const defaultProps = {
  ...requiredDefaultProps,
  ...optionalDefaultProps,
};

// 进度条样式
const playerBarStyle = (config: any) => {
  const { height, tickHeight, tickWidth, tickColorOdd, tickColorEven, parentWidth } = config;

  return {
    height: `${height || tickHeight * 2}px`,
    width: `${parentWidth}px`,
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
  };
};

// 尾缀样式
const playerBarTailStyle = (config: any) => {
  const { tailBgColor, tailColor, tailFontSize, tailWidthPercent, tickHeight } = config;

  return {
    color: tailColor,
    backgroundColor: tailBgColor,
    fontSize: `${tailFontSize}px`,
    width: `${tailWidthPercent}%`,
    height: `${tickHeight}px`,
  };
};

// 渲染 标尺dom
const renderMarkDom = (config: any) => {
  const {
    tickWidth,
    tickHeight,
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
      height: `${tickHeight}px`,
      width: `${tickWidth}px`,
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
    let tipLeft = markLeft - tipWidth / 2 + tickWidth / 2;
    if (frameMode === 'multiple') {
      tipLeft = markLeft - tipWidth / 2 + markMiddleWidth / 2;
    }

    return {
      fontSize: `${tipFontSize}px`,
      color: `${tipColor}`,
      backgroundColor: `${tipBg}`,
      bottom: `${tickHeight}px`,
      left: `${tipLeft}px`,
      height: `${tickHeight}px`,
      width: `${tipWidth}px`,
    };
  };

  const tipValue = calculatevalue({
    markLeft,
    tickWidth,
    splitCount,
    frameMode,
    total,
  });

  return (
    <>
      <div className={cx('player-bar-mark')} ref={markRef} style={markStyle()}>
        <div className={cx('player-bar-mark-middle')} style={middleStyle} />
      </div>
      <div className={cx('player-bar-mark-tip')} style={tipStyle()}>
        {tipValue || '1'}
      </div>
    </>
  );
};

// 根据当前帧数计算标尺左侧距离
const calculateMarkLeft = (config: any) => {
  const { frameMode, total, splitCount, parentWidth, tickWidth, value, markMiddleWidth } = config;

  let markLeft;
  markLeft = (value - 1) * tickWidth;
  if (frameMode === 'multiple') {
    const scale = splitCount / total;

    if (value === total) {
      markLeft = parentWidth - markMiddleWidth;
    }
    markLeft = (value - 1) * (tickWidth * scale);
  }

  return markLeft;
};

// 根据标尺左侧距离计算当前帧数
const calculatevalue = (config: any) => {
  const { markLeft, frameMode, splitCount, total, tickWidth } = config;
  let value;

  value = Math.ceil((markLeft + 1) / tickWidth);
  if (frameMode === 'multiple') {
    const scale = splitCount / total;
    value = Math.ceil((markLeft + 1) / (tickWidth * scale));
  }

  return value;
};

// const PlayerBar = (props:any) => {
const PlayerBar: React.FC<PlayerBarProps> = props => {
  const conbineProps = { ...optionalDefaultProps, ...props };

  const {
    total,
    value,
    splitCount = 20,
    frameMode: fm,
    markMiddleWidth,
    originalFrameRate,
    frameRate,
    parentWidth: size,
    tailWidthPercent,
    onSetValue,
    onSetTotal,
    onSetFrameRate,
    onLoad,
    onStart,
    onPause,
    onPlaybackRateChange,
    seekToFrame,
  } = conbineProps;

  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [frameMode, setFrameMode] = useState<frameModeTypes>(fm);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [frameRateInput, setFrameRateInput] = useState<number | null>(null);
  const [frameTotalInput, setFrameTotalInput] = useState<number | null>(null);
  const [frameCurrentInput, setFrameCurrentInput] = useState<number | null>(null);

  const [isPause, setIsPause] = useState(true);

  const [parentWidth, setParentWidth] = useState(1000);

  const [loading, isLoading] = useState(!!onLoad);
  const [isLoop, setIsLoop] = useState(true);

  let tickWidth = Number((parentWidth / total).toFixed(2));
  if (frameMode === 'multiple') tickWidth = Math.ceil(parentWidth / splitCount);

  // 一帧的宽度
  let frameWidth = tickWidth;
  if (frameMode === 'multiple') {
    const scale = splitCount / total;
    frameWidth = tickWidth * scale;
  }

  const [markLeft, setMarkLeft] = useState(
    calculateMarkLeft({
      value,
      tickWidth,
      splitCount,
      frameMode,
      total,
      markMiddleWidth,
      parentWidth,
    })
  );

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    seekToFrame(value);
  }, [value]);

  // 父元素宽度变化
  useEffect(() => {
    const scale = (100 - tailWidthPercent) / 100;
    setParentWidth(size * scale);
  }, [size]);

  // 帧数 | 总帧数 改变时，标尺位置变化
  useEffect(() => {
    if (total < value) {
      onSetValue(total);
      return;
    }
    setMarkLeft(
      calculateMarkLeft({
        value,
        tickWidth,
        splitCount,
        frameMode,
        total,
        markMiddleWidth,
        parentWidth,
      })
    );
  }, [value, total, parentWidth]);

  // 帧率 改变时，标尺速率变化
  useEffect(() => {
    onPlaybackRateChange();

    if (isPause) return;
    handlePause();
    handlePlay();
  }, [frameRate, total]);

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseDown = (e: any) => {
    setIsMouseDown(true);
    handleMouseEventForMark({ e, mode: 'down' });
  };

  const handleMouseMove = (e: any) => {
    if (!isMouseDown) return;
    handleMouseEventForMark({ e, mode: 'move' });
  };

  // 公共逻辑: 控制标记的鼠标事件。
  const handleMouseEventForMark = (config: any) => {
    const { e, mode } = config;
    const { pageX: cursorLeft } = e;
    const { offsetLeft: contentLeft, offsetWidth: contentWidth } = contentRef?.current as HTMLDivElement;

    const isOverflowLeft = cursorLeft < contentLeft + frameWidth / 2;
    const isOverflowRight = cursorLeft > contentLeft + (contentWidth - frameWidth / 2);

    // 边界处理
    switch (mode) {
      case 'move':
        if (isOverflowLeft || isOverflowRight) return;
      case 'down':
        if (isOverflowLeft) {
          onSetValue(1);
          return;
        }
        if (isOverflowRight) {
          onSetValue(total);
          return;
        }
    }

    let offsetLeft = cursorLeft - contentLeft;
    if (frameMode === 'single') {
      offsetLeft = cursorLeft - contentLeft;
      const offsetCount = Math.ceil(offsetLeft / frameWidth);

      offsetLeft = offsetCount * frameWidth;
    }
    onSetValue(offsetLeft / frameWidth);
  };

  const playSetTimeoutFnId = useRef<any>();
  const handlePlay = () => {
    if (playSetTimeoutFnId.current) return;

    playSetTimeoutFnId.current = setInterval(() => {
      setIsPause(false);
      onSetValue((prev: number) => {
        console.log(`prev total`, prev, total);
        if (prev === total) {
          if (isLoop) {
            return 1;
          } else {
            handlePause();
            return prev;
          }
        }

        return prev + 1;
      });
    }, 1000 / frameRate);

    onStart(isLoop);
  };

  const handlePause = () => {
    clearTimeout(playSetTimeoutFnId.current);
    playSetTimeoutFnId.current = null;
    setIsPause(true);

    onPause();
  };

  const handlePrev = () => {
    onSetValue((prev: number) => {
      if (prev == 1) return prev;
      return prev - 1;
    });
  };

  const handleNext = () => {
    onSetValue((prev: number) => {
      if (prev == total) return prev;
      return prev + 1;
    });
  };

  const handleLeftmost = () => {
    onSetValue(1);
  };

  const handleRightmost = () => {
    onSetValue(total);
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
    <div className={cx('player-bar')}>
      <div className={cx('player-bar-setting')}>
        <div className={cx('player-bar-setting-item')}>
          <span>设置总帧数:</span>
          <InputNumber
            style={{ width: '200px' }}
            controls={false}
            value={frameTotalInput}
            onChange={handleframeTotalInputChange}
            placeholder="请输入总帧数"
            min={1}
            onPressEnter={() =>
              handleBeforeConfirm({
                fn: onSetTotal,
                value: frameTotalInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: onSetTotal,
                value: frameTotalInput,
                min: 1,
              })
            }>
            确定
          </Button>
        </div>

        <div className={cx('player-bar-setting-item')}>
          <span>设置当前帧数:</span>
          <InputNumber
            style={{ width: '200px' }}
            controls={false}
            value={frameCurrentInput}
            required
            onChange={handleframeCurrentInputChange}
            placeholder="请输入当前帧数"
            min={1}
            max={total}
            onPressEnter={() =>
              handleBeforeConfirm({
                fn: onSetValue,
                value: frameCurrentInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: onSetValue,
                value: frameCurrentInput,
                min: 1,
              })
            }>
            确定
          </Button>
        </div>
      </div>
      {/* info */}
      <div className={cx('player-bar-info')}>
        <span>模式: {frameMode === 'multiple' ? '多帧模式' : '单帧模式'}</span>
        <span>fps: {frameRate}</span>
        <span>倍速: {(frameRate / 24).toFixed(2)}x</span>
        <span>
          当前帧数:
          {calculatevalue({
            markLeft,
            tickWidth,
            splitCount,
            frameMode,
            total,
          })}
        </span>
      </div>
      <div className={cx('player-bar-show')}>
        {/* content */}
        <div
          className={cx('player-bar-content')}
          ref={contentRef}
          style={playerBarStyle({ ...conbineProps, tickWidth, parentWidth })}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}>
          {renderMarkDom({
            ...conbineProps,
            contentRef,
            frameMode,
            markLeft,
            markRef,
            tickWidth,
            value,
            total,
          })}
        </div>
        {/* tail */}
        <div className={cx('player-bar-tail')} style={playerBarTailStyle({ ...conbineProps })}>
          {total}
        </div>
      </div>
      <div className={cx('player-bar-control')}>
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
          value="frame"
          suffixIcon={<CaretDownOutlined />}
          style={{ width: 120 }}
          options={[
            {
              value: 'frame',
              label: `${calculatevalue({
                markLeft,
                tickWidth,
                splitCount,
                frameMode,
                total,
              })}/${total}`,
            },
            { value: 'time', label: '12:12' },
          ]}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Dropdown
          destroyPopupOnHide
          trigger={['click']}
          overlayStyle={{ padding: 0 }}
          overlayClassName={cx('frame-dropdown')}
          open={dropdownOpen}
          dropdownRender={() => {
            return (
              <>
                <div className={cx('frame-dropdown-header')}>
                  <span className={cx('key')}>帧率</span>
                  <span className={cx('value')}>倍率</span>
                </div>
                <div className={cx('frame-dropdown-content')}>
                  {frameOptions.map((fps, index) => {
                    return (
                      <div
                        key={index}
                        className={cx(
                          'frame-dropdown-content-item',
                          `${fps === frameRate && 'frame-dropdown-content-item--active'}`
                        )}
                        onClick={() => {
                          onSetFrameRate(fps);
                          setDropdownOpen(false);
                        }}>
                        <span className={cx('key')}>{`${fps}fps`} </span>
                        <span className={cx('value')}>{`${fps / 24}x`}</span>
                        {fps === originalFrameRate && <span>原始帧率</span>}
                      </div>
                    );
                  })}
                </div>
                <Divider style={{ marginBlock: '4px 0' }} />
                <div className={cx('frame-dropdown-footer')}>
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
                        fn: onSetFrameRate,
                        value: frameRateInput,
                        min: 1,
                      });
                      setDropdownOpen(false);
                    }}
                    onKeyDown={e => {
                      if (e.keyCode === 27) setDropdownOpen(false);
                    }}
                    autoFocus
                  />
                  <Button
                    type="link"
                    // style={{ color: 'rgba(126, 135, 255, 1)' }}
                    onClick={() => {
                      handleBeforeConfirm({
                        fn: onSetFrameRate,
                        value: frameRateInput,
                        min: 1,
                      });
                      setDropdownOpen(false);
                    }}>
                    确定
                  </Button>
                </div>
              </>
            );
          }}>
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
