/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, Dropdown, InputNumber, Divider, Tooltip, Slider } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useFullscreen } from 'ahooks';
// import MyIcon from '@/components/MyIcon';
import styles from './index.module.css';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles)
dayjs.extend(duration);

const frameOptions = [72, 48, 36, 30, 24, 18, 12]; // 帧率动态计算 , 改成倍率
type frameOptionsType = 12 | 18 | 24 | 30 | 36 | 48 | 72;

// 帧数模式
type frameModeTypes = 'single' | 'multiple' | undefined;

// animation / movie

// await res = load();

// const mockData = {
//   name: animation.name,
//   frames: Math.round(animation.to - animation.from),
//   fps: 60, // 暂时写死
// };

interface PlayerBarCallbackProps {
  // setFrameIndex: (frameIndex: any,name: string) => void; // 弃用
  // goToFrame: (frameIndex: any,name: string) => void;

  onSetFrameRate: (frameRate: any) => void; // 弃用
  onStart?: (loop: boolean, name?: string) => void;
  onPause?: (name?: string) => void;
  onPlaybackRateChange?: (name?: string) => void;
  seekToFrame?: (frameIndex: number) => void;
}

interface PlayerBarOriginalProps {
  frameTotal: number; // 在数组中获取
  frameRate: number; // 在数组中获取
  originalFrameRate?: frameOptionsType; // 在数组中获取

  reviewCountsByFrame: Array<any>;
  splitCount?: number; // 大于1000时，一格代表多个帧。

  parentWidth: number;
  height?: number;
  tickHeight?: number;
  tickColorBgOdd?: string;
  tickColorBgEven?: string;
  markMiddleWidth?: number;
  tipColor?: string;
  tipFontSize?: string;
  tipBg?: string;
  tipHeight?: number;
  tipWidth?: number;
  tailWidthPercent?: number;
  tailColor?: string;
  tailBgColor?: string;
  tailFontSize?: number;
}

type PlayerBarProps = PlayerBarCallbackProps & PlayerBarOriginalProps;

export const requiredDefaultProps = {
  reviewCountsByFrame: [
    {
      frameIndex: 5,
      count: 3,
    },
    {
      frameIndex: 6,
      count: 3,
    },
    {
      frameIndex: 7,
      count: 3,
    },
    {
      frameIndex: 10,
      count: 3,
    },
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

export const optionalDefaultProps = {
  splitCount: 20,
  originalFrameRate: 24,
  height: 40,
  tickHeight: 20,
  tickColorBgOdd: 'rgba(21, 24, 36, 1)',
  tickColorBgEven: 'rgba(34, 38, 56, 1)',
  tipWidth: 50,
  tipHeight: 20,
  tipFontSize: 12,
  tipColor: 'rgba(255, 255, 255, 1)',
  tipBg: 'var(--eevee-theme-color-primary)',
  tailWidthPercent: 8,
  tailColor: 'rgba(255, 255, 255, 1)',
  tailBgColor: '#16213E',
  tailFontSize: 14,
  markMiddleColorBg: 'var(--eevee-theme-color-primary)',
  markMiddleWidth: 2,
  onStart: (loop = false) => {},
  onPause: () => {},
  onPlaybackRateChange: () => {},
  seekToFrame: (frameIndex: number) => {},
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
  const { tickWidth, tickHeight, markLeft, frameMode, markMiddleWidth } = config;
  const style = {
    height: `${tickHeight}px`,
    width: `${tickWidth}px`,
    bottom: 0,
    left: `${markLeft}px`,
  };

  if (frameMode === 'multiple') {
    Object.assign(style, { width: `${markMiddleWidth}px` });
  }

  return style;
};

const markHoverStyle = (config: any) => {
  const { tickWidth, tickHeight, markColorBg, markHoverLeft = 50, frameMode, markMiddleWidth, isMouseHover } = config;
  const opacity = isMouseHover && 1;
  const style = {
    height: `${tickHeight}px`,
    width: `${tickWidth}px`,
    background: markColorBg,
    bottom: 0,
    left: `${markHoverLeft}px`,
    opacity,
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
    tipWidth,
    tickWidth,
    frameMode,
    markMiddleWidth,
    tipFontSize,
    tipColor,
    tipBg,
    tipHeight,
    tickHeight,
    isMouseHover,
    isPause,
  } = config;

  let { markLeft } = config;
  markLeft = isPause ? markHoverLeft : markLeft;

  let tipLeft = markLeft - tipWidth / 2 + tickWidth / 2;
  if (frameMode === 'multiple') {
    tipLeft = markLeft - tipWidth / 2 + markMiddleWidth / 2;
  }

  // const tipAfterHeight = 12;

  return {
    fontSize: `${tipFontSize}px`,
    color: `${tipColor}`,
    backgroundColor: `${tipBg}`,
    bottom: `${tickHeight}px`,
    left: `${tipLeft}px`,
    height: `${tipHeight}px`,
    width: `${tipWidth}px`,
    display: isPause || isMouseHover ? 'flex' : 'none',
    // display: 'flex',
  };
};

const renderMarkDom = (config: any) => {
  const { markRef, frameMode, splitCount = 20, isMouseHover, isPause } = config;

  let { reviewCountsByFrame } = config;
  reviewCountsByFrame = arrToMap(reviewCountsByFrame, 'frameIndex');
  const keys = Array.from(reviewCountsByFrame.keys());

  const tipValue = calculateFrameIndex({
    splitCount,
    ...config,
  });

  return (
    <>
      <div className={cx('mark')} ref={markRef} style={markStyle({ ...config })}>
        <div className={cx('mark-middle')} style={middleStyle({ ...config })} />
      </div>
      {(!keys.includes(tipValue) || !isPause) && (
        <div className={cx('mark-tip', !isPause ? 'mark-tip--playing' : '')} style={tipStyle({ ...config })}>
          {tipValue || '1'}
        </div>
      )}
      {keys.includes(tipValue) ? (
        <Tooltip open={isMouseHover} placement="top" title={`${reviewCountsByFrame.get(tipValue).count}条批注`}>
          <div
            className={cx('mark', 'mark-hover', 'mark-hover--review')}
            ref={markRef}
            style={markHoverStyle({ ...config })}>
            {frameMode !== 'single' && <div className={cx('mark-middle')} style={middleStyle({ ...config })} />}
          </div>
        </Tooltip>
      ) : (
        <div className={cx('mark', 'mark-hover')} ref={markRef} style={markHoverStyle({ ...config })}>
          <div className={cx('mark-middle')} style={middleStyle({ ...config })} />
        </div>
      )}
    </>
  );
};

const calculateMarkLeft = (config: any) => {
  const {
    frameMode,
    tickWidth,
    frameIndex,
    markHoverLeft,
    splitCount,
    frameTotal,
    barWidth,
    markMiddleWidth,
    isClickForSet,
    onSetIsClickForSet,
  } = config;

  let markLeft;
  if (frameMode === 'multiple') {
    if (isClickForSet) {
      onSetIsClickForSet(false);
      return markHoverLeft;
    }

    const scale = splitCount / frameTotal;

    if (frameIndex === frameTotal) {
      markLeft = barWidth - markMiddleWidth;
    }
    markLeft = (frameIndex - 1) * (tickWidth * scale);
    return markLeft;
  }

  markLeft = (frameIndex - 1) * tickWidth;

  return markLeft;
};

const calculateFrameIndex = (config: any) => {
  const { markHoverLeft, frameMode, splitCount, frameTotal, tickWidth, isPause } = config;
  let { markLeft } = config;
  markLeft = isPause ? markHoverLeft : markLeft;

  let frameIndex;
  frameIndex = Math.ceil((markLeft + 1) / tickWidth);

  if (frameMode === 'multiple') {
    const scale = splitCount / frameTotal;
    frameIndex = Math.ceil((markLeft + 1) / (tickWidth * scale));
  }

  return frameIndex;
};

const calculateTime = (config: any) => {
  const { frameIndex, frameRate } = config;
  const seconds = frameIndex / frameRate;

  const durationObj = dayjs.duration(seconds, 'seconds');
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();
  const secondsLeft = durationObj.seconds();

  return `${hours}:${minutes}:${secondsLeft}`;
};

/******* utils ******/
const arrToMap = (arr: any, targetKey: any) => {
  return new Map(
    arr.map((item: any) => {
      return [item[targetKey], item];
    })
  );
};
/*******************/

const PlayerBar: React.FC<PlayerBarProps> = props => {
  const conbineProps = { ...optionalDefaultProps, ...props };

  const {
    frameTotal,
    splitCount = 20,
    markMiddleWidth,
    originalFrameRate,
    frameRate,
    parentWidth,
    tailWidthPercent,
    reviewCountsByFrame,
    onSetFrameRate,
    onStart,
    onPause,
    onPlaybackRateChange,
    seekToFrame,
  } = conbineProps;

  // 须暴露的方法
  const [dataSource, setDataSource] = useState<any>([]);
  const [frameIndex, setFrameIndex] = useState<any>(1);

  const onLoad = (dataSource: any) => {
    // const { } = dataSource;
    setDataSource(dataSource);
  };

  const onFrameIndexChange = (frameIndex: number, name?: string) => {
    setFrameIndex(frameIndex);
  };

  // 显示器
  const playerBarRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  const [isClickForSet, setIsClickForSet] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseHover, setIsMouseHover] = useState(false);
  const [frameMode, setFrameMode] = useState<frameModeTypes>(frameTotal >= 1000 ? 'multiple' : 'single');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [frameRateInput, setFrameRateInput] = useState<number | null>(null);
  const [isPause, setIsPause] = useState(true);
  const [barWidth, setbarWidth] = useState(1000);

  // 播放器
  const [volume, setVolume] = useState(0);
  const [isSoundOff, setIsSoundOff] = useState(false);
  const [isLoop, setIsLoop] = useState(true);
  const [isFullscreen, { enterFullscreen, exitFullscreen, toggleFullscreen }] = useFullscreen(document.documentElement);

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
    reviewCountsByFrame,
    isClickForSet,
    isPause,
    onSetIsClickForSet: setIsClickForSet,
  };

  const [markHoverLeft, setmarkHoverLeft] = useState(60);
  const [markLeft, setMarkLeft] = useState(calculateMarkLeft({ ...commonConfig }));

  Object.assign(commonConfig, { markLeft, markHoverLeft });

  useEffect(() => {
    // playerBarRef.current
    //  const { onLoad, onFrameIndexChange } = playerBarRef.current as any;
    // console.log(`onLoad, onFrameIndexChange`,onLoad, onFrameIndexChange)
  }, []);

  useEffect(() => {
    seekToFrame(frameIndex);
  }, [frameIndex]);

  useEffect(() => {
    const {
      name: animationName,
      from: animationFrom,
      to: animationTo,
      frames, // Math.round(animation.to - animation.from)
      fps = 60, // 暂时写死
    } = dataSource;
  }, [dataSource]);

  useEffect(() => {
    const scale = (100 - tailWidthPercent) / 100;
    setbarWidth(parentWidth * scale);
  }, [parentWidth]);

  useEffect(() => {
    const mode = frameTotal >= 1000 ? 'multiple' : 'single';
    setFrameMode(mode);
  }, [frameTotal]);

  useEffect(() => {
    if (frameTotal < frameIndex) {
      setFrameIndex(frameTotal);
      return;
    }
    setMarkLeft(calculateMarkLeft({ ...commonConfig }));
  }, [frameIndex, frameTotal, barWidth]);

  useEffect(() => {
    onPlaybackRateChange();

    if (isPause) return;
    handlePause();
    handlePlay();
  }, [frameRate, frameTotal, isLoop]);

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

    const isOverflowLeft = cursorLeft < contentLeft + frameWidth / 2;
    const isOverflowRight = cursorLeft > contentLeft + (contentWidth - frameWidth / 2);

    // 边界处理
    switch (mode) {
      case 'move':
      case 'hover':
        if (isOverflowLeft || isOverflowRight) return;
      case 'down':
        if (isOverflowLeft) {
          setFrameIndex(1);
          return;
        }
        if (isOverflowRight) {
          setFrameIndex(frameTotal);
          return;
        }
    }

    let offsetLeft = cursorLeft - contentLeft;
    const offsetCount = Math.ceil(offsetLeft / frameWidth);

    if (mode !== 'hover') {
      offsetLeft = offsetCount * frameWidth;
      setFrameIndex(Number((offsetLeft / frameWidth).toFixed(0)));
      return;
    }

    if (frameMode === 'single') {
      offsetLeft = (offsetCount - 1) * frameWidth;
    }

    setIsClickForSet(true);
    setmarkHoverLeft(offsetLeft);
  };

  const playSetTimeoutFnId = useRef<any>();
  const handlePlay = () => {
    if (playSetTimeoutFnId.current) return;

    playSetTimeoutFnId.current = setInterval(() => {
      setIsPause(false);
      setFrameIndex((prev: number) => {
        if (prev === frameTotal) {
          if (isLoop) return 1;

          handlePause();
          return prev;
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
    setFrameIndex((prev: number) => {
      if (prev == 1) return prev;
      return prev - 1;
    });
  };

  const handleNext = () => {
    setFrameIndex((prev: number) => {
      if (prev == frameTotal) return prev;
      return prev + 1;
    });
  };

  const handleFrameRateInputChange = (frameIndex: number | null) => {
    setFrameRateInput(frameIndex as number);
  };

  const handleBeforeConfirm = (config: any) => {
    const { frameIndex, min, fn } = config;
    if (frameIndex === null || frameIndex === undefined) return;
    if (frameIndex < min) return;

    fn(frameIndex);
  };

  /******播放器******/
  const handleSoundChange = (val:any) => {
    isSoundOff && setIsSoundOff(false);
    setVolume(val);
  };
  /*****************/

  // ckb-TODO: 暴露ref，为video提供方法
  return (
    <div ref={playerBarRef} className={cx('player-bar')}>
      <div className={cx('show')}>
        {/* content */}
        <div
          className={cx('content')}
          ref={contentRef}
          style={playerBarStyle({ ...conbineProps, tickWidth, barWidth })}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}>
          {renderMarkDom({ ...conbineProps, ...commonConfig })}
        </div>
        {/* tail */}
        <div className={cx('tail')} style={playerBarTailStyle({ ...conbineProps })}>
          {frameTotal}
        </div>
      </div>
      {/* control */}
      <div className={cx('control')}>
        <div className={cx('left-part')}>
          {/* {isPause ? (
            <MyIcon onClick={handlePlay} icon="play-circle-stroke" size={24} className={cx('control-icon')} />
          ) : (
            <MyIcon onClick={handlePause} icon="pause-circle" size={24} className={cx('control-icon')} />
          )} */}
          <Select
            defaultValue="frame"
            suffixIcon={<CaretDownOutlined />}
            popupClassName={cx('format-select')}
            style={{ height: '30px', width: '90px', marginLeft: '13.5px' }}
            options={[
              {
                value: 'frame',
                label: `${frameIndex}/${frameTotal}`,
              },
              {
                value: 'time',
                label: `${calculateTime({ frameIndex, frameRate })}/${calculateTime({
                  frameIndex: frameTotal,
                  frameRate,
                })}`,
              },
            ]}
          />
          {/* <MyIcon
            onClick={handlePrev}
            icon="page-first"
            size={24}
            style={{ marginLeft: '6px' }}
            className={cx('control-icon', frameIndex == 1 ? 'control-icon--disabled' : '')}
          />
          <MyIcon
            onClick={handleNext}
            icon="page-last"
            size={24}
            style={{ marginLeft: '5px' }}
            className={cx('control-icon', frameIndex == frameTotal ? 'control-icon--disabled' : '')}
          />
          <MyIcon
            onClick={() => setIsLoop(!isLoop)}
            style={{ marginInline: '12px 20px' }}
            icon={isLoop ? 'repeat-2-line' : 'order-play-line'}
            size={24}
            className={cx('control-icon')}
          /> */}
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
                  <Divider style={{ marginBlock: '0 4px' }} />
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
                          <div className={cx('key')}>{`${fps}fps`} </div>
                          <div className={cx('value')}>{`${fps / 24}x`}</div>
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
                      onChange={handleFrameRateInputChange}
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
                      style={{
                        color: 'rgba(126, 135, 255, 1)',
                        paddingInline: '12px',
                      }}
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
            <Select
              // suffixIcon={<MyIcon icon="chevron-down" style={{ rotate: '180deg' }} />}
              open={false}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              value={`${frameRate}fps`}></Select>
          </Dropdown>
          <Select
            defaultValue={`动作001`}
            options={[
              {
                value: 'action1',
                label: '动作001',
              },
              {
                value: 'action2',
                label: '动作002',
              },
            ]}
            style={{ marginLeft: '12px' }}
            // suffixIcon={<MyIcon icon="chevron-down" style={{ rotate: '180deg' }} />}
          />
        </div>

        <div className={cx('right-part')}>
          <div className={cx('sound-wrap')}>
            {/* <MyIcon
              onClick={() => setIsSoundOff(!isSoundOff)}
              icon={isSoundOff ? 'sound-off' : 'sound'}
              size={20}
              className={cx('control-icon')}
            /> */}
            <Slider
              className={cx('sound-slider')}
              value={volume}
              onChange={handleSoundChange}
              defaultValue={30}
              disabled={false}
            />
          </div>
          {/* <MyIcon onClick={enterFullscreen} icon="shiyingpingmufangda2" size={24} className={cx('control-icon')} /> */}
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
