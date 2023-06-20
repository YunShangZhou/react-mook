import React, { Component } from "react";
import PlayerBar, { mockProps } from "../../components/PlayerBar";
import "./style.scss";

class ExamplePage extends Component {
  render() {
    return (
      <div className="example-page">
        <PlayerBar {...mockProps} />
        <br />
        <br />
        <PlayerBar {...mockProps} frameMode="multiple" />
      </div>
    );
  }
}

export default ExamplePage;
