import React from 'react';
import './index.scss';

// 倍速
type velocityTypes = 1 | 1.25 | 1.5 | 1.75 | 2

interface TimeRulerProps {
    defaultValue?: string;
    total?: number;
    velocity?: velocityTypes;
    gap?: number;
}

const TimeRuler = (props: any) => (
  <div className="time-ruler">
    <div className="example" />
    <div className="example2" />
    <div className="example3" />
  </div>
);

export default TimeRuler;
