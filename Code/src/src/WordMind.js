import React, { Component } from 'react';
import Letters from './components/LetterComponent';
import Numbers from './components/NumberComponent';
import Emojis from './components/EmojiComponent';

class WordMind extends React.Component {
	

	
  render(){
    return (
      <div>
        <h3>Here's the full set of letters.</h3>
		<h3>Let's try to type the word "mind"</h3>
		<input type="text" className="display" readOnly></input>
		<Letters />
		<button onClick={this.props.wordMindHandler}>Continue</button>
		
      </div>
    )
  }
}

export default WordMind;