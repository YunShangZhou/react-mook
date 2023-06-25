import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, Dropdown, Space, InputNumber, Divider, Tooltip } from 'antd';
import { CaretDownOutlined, DownOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './index.module.css';

const cx = classNames.bind(styles);

const frameOptions = [12, 18, 24, 30, 36, 48, 72];
type frameOptionsType = 12 | 18 | 24 | 30 | 36 | 48 | 72;

// 帧数模式
type frameModeTypes = 'single' | 'multiple' | undefined;

interface PlayerBarCallbackProps {
  onSetFrameIndex: (frameIndex: any) => void;
  onSetFrameTotal: (frameTotal: any) => void;
  onSetFrameRate: (frameRate: any) => void;
  onLoad?: () => void;
  onStart?: (loop: boolean) => void;
  onPause?: () => void;
  onPlaybackRateChange?: () => void;
  seekToFrame?: (frameIndex: number) => void;
  onFrameTotalChange?: (frameTotal: number) => void;
  onFrameRateChange?: (frameRate: number) => void;
}

interface PlayerBarOriginalProps {
  frameIndex: number;
  frameTotal: number;
  frameRate: number;
  parentWidth: number;
  reviewCountsByFrame: Array<any>;

  originalFrameRate?: frameOptionsType;
  splitCount?: number; // 多帧模式下,格子数量
  frameMode?: frameModeTypes;
  height?: number;
  tickHeight?: number;
  tickColorBgOdd?: string;
  tickColorBgEven?: string;
  markColorBg?: string;
  markMiddleColorBg?: string;
  markMiddleWidth?: number;
  tipColor?: string;
  tipFontSize?: string;
  tipBg?: string;
  tipWidth?: number;
  tailWidthPercent?: number;
  tailColor?: string;
  tailBgColor?: string;
  tailFontSize?: number;
}

type PlayerBarProps = PlayerBarCallbackProps & PlayerBarOriginalProps;

// 必填属性
export const requiredDefaultProps = {
  frameTotal: 60,
  frameIndex: 20,
  frameRate: 48,
  reviewCountsByFrame: [
    {
      frameIndex: 30,
      count: 3,
    },
    {
      frameIndex: 60,
      count: 5,
    },
  ],
};

// 选填属性
export const optionalDefaultProps = {
  // width: '100%',
  splitCount: 20,
  frameMode: 'single' as frameModeTypes,
  originalFrameRate: 24,
  height: 40,
  tickHeight: 20,
  tickColorBgOdd: '#3F5770',
  tickColorBgEven: '#2F4459',
  tipWidth: 50,
  tipFontSize: 12,
  tipColor: 'white',
  tipBg: 'rgba(63, 87, 112, 1)',
  tailWidthPercent: 10,
  tailColor: '#707AFF',
  tailBgColor: '#16213E',
  tailFontSize: 14,
  markColorBg: `linear-gradient(to bottom , rgba(134, 142, 255, 0.53) , rgba(134, 142, 255, 0))`,
  markMiddleColorBg: 'rgba(169, 175, 252, 0.53)',
  markMiddleWidth: 2,
  onLoad: () => {},
  onStart: (loop = false) => {},
  onPause: () => {},
  onPlaybackRateChange: () => {},
  seekToFrame: (frameIndex: number) => {},
  onFrameTotalChange: () => {},
  onFrameRateChange: () => {},
};

export const defaultProps = {
  ...requiredDefaultProps,
  ...optionalDefaultProps,
};

const playerBarStyle = (config: any) => {
  const { height, tickHeight, tickWidth, tickColorBgOdd, tickColorBgEven, barWidth } = config;

  return {
    height: `${height || tickHeight * 2}px`,
    width: `${barWidth}px`,
    backgroundImage: `repeating-linear-gradient(
      to right,
      ${tickColorBgOdd} 0,
      ${tickColorBgOdd} ${tickWidth}px,
      ${tickColorBgEven} ${tickWidth}px,
      ${tickColorBgEven} ${tickWidth * 2}px
    )`,
    backgroundSize: `100% ${tickHeight}px`,
    backgroundRepeat: `no-repeat`,
    backgroundPosition: `0 100%, 0 100%`,
  };
};

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

const markStyle = (config: any) => {
  const { tickWidth, tickHeight, markColorBg, markLeft, frameMode, markMiddleWidth } = config;
  const style = {
    height: `${tickHeight}px`,
    width: `${tickWidth}px`,
    background: markColorBg,
    // bottom: `${tickHeight}px`,
    bottom: 0,
    left: `${markLeft}px`,
  };

  if (frameMode === 'multiple') {
    Object.assign(style, { width: `${markMiddleWidth}px` });
  }

  return style;
};

const markHoverStyle = (config: any) => {
  const { tickWidth, tickHeight, markColorBg, markHoverLeft = 50, frameMode, markMiddleWidth } = config;
  const style = {
    height: `${tickHeight}px`,
    width: `${tickWidth}px`,
    background: markColorBg,
    // bottom: `${tickHeight}px`,
    bottom: 0,
    left: `${markHoverLeft}px`,
  };

  if (frameMode === 'multiple') {
    Object.assign(style, { width: `${markMiddleWidth}px` });
  }

  return style;
};

const middleStyle = (config: any) => {
  const { markMiddleWidth, markMiddleColorBg } = config;

  return {
    width: `${markMiddleWidth}px`,
    backgroundColor: markMiddleColorBg,
  };
};

const tipStyle = (config: any) => {
  const {
    markHoverLeft,
    markLeft,
    tipWidth,
    tickWidth,
    frameMode,
    markMiddleWidth,
    tipFontSize,
    tipColor,
    tipBg,
    tickHeight,
    isMouseHover,
  } = config;

  let tipLeft = markHoverLeft - tipWidth / 2 + tickWidth / 2;
  if (frameMode === 'multiple') {
    tipLeft = markHoverLeft - tipWidth / 2 + markMiddleWidth / 2;
  }

  return {
    fontSize: `${tipFontSize}px`,
    color: `${tipColor}`,
    backgroundColor: `${tipBg}`,
    bottom: `${tickHeight}px`,
    left: `${tipLeft}px`,
    height: `${tickHeight}px`,
    width: `${tipWidth}px`,
    display: isMouseHover ? 'flex' : 'none',
  };
};

const renderMarkDom = (config: any) => {
  const { markRef, frameMode, splitCount = 20 } = config;

  const tipValue = calculateFrameIndex({
    splitCount,
    ...config,
  });

  return (
    <>
      <div className={cx('player-bar-mark')} ref={markRef} style={markStyle({ ...config })}>
        <div className={cx('player-bar-mark-middle')} style={middleStyle({ ...config })} />
      </div>
      {tipValue !== 20 && (
        <div className={cx('player-bar-mark-tip')} style={tipStyle({ ...config })}>
          {tipValue || '1'}
        </div>
      )}
      {tipValue === 20 ? (
        <Tooltip placement="top" title={'3条批注'}>
          <div
            className={cx('player-bar-mark', 'player-bar-mark-hover', 'player-bar-mark-hover--review')}
            ref={markRef}
            style={markHoverStyle({ ...config })}>
            {frameMode !== 'single' && (
              <div className={cx('player-bar-mark-middle')} style={middleStyle({ ...config })} />
            )}
          </div>
        </Tooltip>
      ) : (
        <div
          className={cx('player-bar-mark', 'player-bar-mark-hover')}
          ref={markRef}
          style={markHoverStyle({ ...config })}>
          <div className={cx('player-bar-mark-middle')} style={middleStyle({ ...config })} />
        </div>
      )}
    </>
  );
};

const calculateMarkLeft = (config: any) => {
  const { frameMode, frameTotal, splitCount, barWidth, tickWidth, frameIndex, markMiddleWidth } = config;

  let markLeft;
  markLeft = (frameIndex - 1) * tickWidth;
  if (frameMode === 'multiple') {
    const scale = splitCount / frameTotal;

    if (frameIndex === frameTotal) {
      markLeft = barWidth - markMiddleWidth;
    }
    markLeft = (frameIndex - 1) * (tickWidth * scale);
  }

  return markLeft;
};

const calculateFrameIndex = (config: any) => {
  const { markHoverLeft, markLeft, frameMode, splitCount, frameTotal, tickWidth } = config;
  let frameIndex;

  frameIndex = Math.ceil((markHoverLeft + 1) / tickWidth);
  if (frameMode === 'multiple') {
    const scale = splitCount / frameTotal;
    frameIndex = Math.ceil((markHoverLeft + 1) / (tickWidth * scale));
  }

  return frameIndex;
};

const PlayerBar: React.FC<PlayerBarProps> = props => {
  const conbineProps = { ...optionalDefaultProps, ...props };

  const {
    frameTotal,
    frameIndex,
    splitCount = 20,
    frameMode: fm,
    markMiddleWidth,
    originalFrameRate,
    frameRate,
    parentWidth,
    tailWidthPercent,
    onSetFrameIndex,
    onSetFrameTotal,
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
  const [isMouseHover, setIsMouseHover] = useState(false);
  const [frameMode, setFrameMode] = useState<frameModeTypes>(fm);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [frameRateInput, setFrameRateInput] = useState<number | null>(null);
  const [frameTotalInput, setFrameTotalInput] = useState<number | null>(null);
  const [frameCurrentInput, setFrameCurrentInput] = useState<number | null>(null);

  const [isPause, setIsPause] = useState(true);

  const [barWidth, setbarWidth] = useState(1000);

  const [loading, isLoading] = useState(!!onLoad);
  const [isLoop, setIsLoop] = useState(true);

  let tickWidth = Number((barWidth / frameTotal).toFixed(2));
  if (frameMode === 'multiple') tickWidth = Math.ceil(barWidth / splitCount);

  // 一帧的宽度
  let frameWidth = tickWidth;
  if (frameMode === 'multiple') {
    const scale = splitCount / frameTotal;
    frameWidth = tickWidth * scale;
  }

  const commonConfig = {
    contentRef,
    tickWidth,
    splitCount,
    frameMode,
    frameTotal,
    frameIndex,
    markMiddleWidth,
    barWidth,
    markRef,
    isMouseHover,
  };

  const [markHoverLeft, setmarkHoverLeft] = useState(60);
  const [markLeft, setMarkLeft] = useState(calculateMarkLeft({ ...commonConfig }));
  Object.assign(commonConfig, { markLeft, markHoverLeft });

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    seekToFrame(frameIndex);
  }, [frameIndex]);

  // 父元素宽度变化
  useEffect(() => {
    const scale = (100 - tailWidthPercent) / 100;
    setbarWidth(parentWidth * scale);
  }, [parentWidth]);

  // 帧数 | 总帧数 改变时，标尺位置变化
  useEffect(() => {
    if (frameTotal < frameIndex) {
      onSetFrameIndex(frameTotal);
      return;
    }
    setMarkLeft(calculateMarkLeft({ ...commonConfig }));
  }, [frameIndex, frameTotal, barWidth]);

  // 帧率 改变时，标尺速率变化
  useEffect(() => {
    onPlaybackRateChange();

    if (isPause) return;
    handlePause();
    handlePlay();
  }, [frameRate, frameTotal]);

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsMouseHover(false);
  };

  const handleMouseDown = (e: any) => {
    setIsMouseDown(true);
    handleMouseEventForMark({ e, mode: 'down' });
  };

  const handleMouseMove = (e: any) => {
    !isMouseHover && setIsMouseHover(true);
    handleMouseEventForMark({ e, mode: 'hover' });

    if (!isMouseDown) return;
    handleMouseEventForMark({ e, mode: 'move' });
  };

  // 公共逻辑: 控制标记的鼠标事件。
  const handleMouseEventForMark = (config: any) => {
    const { e, mode } = config;
    const { pageX: cursorLeft } = e;
    const { offsetLeft: contentLeft, offsetWidth: contentWidth } = contentRef?.current as HTMLDivElement;

    let offsetLeft = cursorLeft - contentLeft;
    if (frameMode === 'single') {
      offsetLeft = cursorLeft - contentLeft;
      const offsetCount = Math.ceil(offsetLeft / frameWidth);

      offsetLeft = (offsetCount - 1) * frameWidth;
    }

    const isOverflowLeft = cursorLeft < contentLeft + frameWidth / 2;
    const isOverflowRight = cursorLeft > contentLeft + (contentWidth - frameWidth / 2);

    // 边界处理
    switch (mode) {
      case 'move':
      case 'hover':
        if (isOverflowLeft || isOverflowRight) return;
      case 'down':
        if (isOverflowLeft) {
          onSetFrameIndex(1);
          return;
        }
        if (isOverflowRight) {
          onSetFrameIndex(frameTotal);
          return;
        }
    }

    if (mode !== 'hover') {
      onSetFrameIndex((offsetLeft / frameWidth).toFixed(0));
      return;
    }

    setmarkHoverLeft(offsetLeft);
  };

  const playSetTimeoutFnId = useRef<any>();
  const handlePlay = () => {
    if (playSetTimeoutFnId.current) return;

    playSetTimeoutFnId.current = setInterval(() => {
      setIsPause(false);
      onSetFrameIndex((prev: number) => {
        if (prev === frameTotal) {
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
    onSetFrameIndex((prev: number) => {
      if (prev == 1) return prev;
      return prev - 1;
    });
  };

  const handleNext = () => {
    onSetFrameIndex((prev: number) => {
      if (prev == frameTotal) return prev;
      return prev + 1;
    });
  };

  const handleLeftmost = () => {
    onSetFrameIndex(1);
  };

  const handleRightmost = () => {
    onSetFrameIndex(frameTotal);
  };

  // 帧率 input
  const handleframeRateInputChange = (frameIndex: number | null) => {
    setFrameRateInput(frameIndex as number);
  };

  // 总帧数 input
  const handleframeTotalInputChange = (frameIndex: number | null) => {
    setFrameTotalInput(frameIndex as number);
  };

  // 当前帧数 input
  const handleframeCurrentInputChange = (frameIndex: number | null) => {
    setFrameCurrentInput(frameIndex as number);
  };

  // input赋值前做处理
  const handleBeforeConfirm = (config: any) => {
    const { frameIndex, min, fn } = config;
    if (frameIndex === null || frameIndex === undefined) return;
    if (frameIndex < min) return;

    fn(frameIndex);
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
                fn: onSetFrameTotal,
                frameIndex: frameTotalInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: onSetFrameTotal,
                frameIndex: frameTotalInput,
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
            max={frameTotal}
            onPressEnter={() =>
              handleBeforeConfirm({
                fn: onSetFrameIndex,
                frameIndex: frameCurrentInput,
                min: 1,
              })
            }
          />
          <Button
            type="link"
            onClick={() =>
              handleBeforeConfirm({
                fn: onSetFrameIndex,
                frameIndex: frameCurrentInput,
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
          {frameIndex}
        </span>
      </div>
      <div className={cx('player-bar-show')}>
        {/* content */}
        <div
          className={cx('player-bar-content')}
          ref={contentRef}
          style={playerBarStyle({ ...conbineProps, tickWidth, barWidth })}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}>
          {renderMarkDom({ ...conbineProps, ...commonConfig })}
        </div>
        {/* tail */}
        <div className={cx('player-bar-tail')} style={playerBarTailStyle({ ...conbineProps })}>
          {frameTotal}
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
        <Select
          // onChange={handleChange}
          value="frame"
          suffixIcon={<CaretDownOutlined />}
          style={{ width: 120 }}
          options={[
            {
              value: 'frame',
              label: `${frameIndex}/${frameTotal}`,
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
                  <span className={cx('frameIndex')}>倍率</span>
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
                        <span className={cx('frameIndex')}>{`${fps / 24}x`}</span>
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
                        frameIndex: frameRateInput,
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
                        frameIndex: frameRateInput,
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
