import React from 'react';
import classNames from 'classnames/bind';
import PlayerBar, { mockProps } from '../../components/PlayerBar';
import styles from './index.module.css';

const cx = classNames.bind(styles);

const ExamplePage = () => {
  return (
    <div className={cx('example-page')}>
      <PlayerBar {...mockProps} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      {/* <PlayerBar {...mockProps} frameMode="multiple" /> */}
    </div>
  );
};

export default ExamplePage;
