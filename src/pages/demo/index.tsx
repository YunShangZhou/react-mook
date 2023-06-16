// import PlayerBar from "../../components/PlayerBar";
import PlayerBar from "../../components/PlayerBar/index";
import React, { Component } from "react";
import './style.scss';

const mockProps = {
  width: 700,
  height: 30,
  total: 436,
  gap: 100,
};

class DemoPage extends Component {
  render() {
    return (
      <div className="demo-page">
        <div>DemoPage 页面</div>
        <PlayerBar  {...mockProps}/>
      </div>
    );
  }
}

export default DemoPage;
