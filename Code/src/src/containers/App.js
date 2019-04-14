import React, { Component } from 'react';
import io from "socket.io-client";
import '../App.css';
import { getRandomArray } from '../helpers/shuffle';

import Letters from '../components/LetterComponent';
import Numbers from '../components/NumberComponent';
import Emojis from '../components/EmojiComponent';

// Getting rows
const row1 = document.getElementsByClassName('row1');
const row2 = document.getElementsByClassName('row2');
const row3 = document.getElementsByClassName('row3');
const row4 = document.getElementsByClassName('row4');
const row5 = document.getElementsByClassName('row5');
const rows = [row1, row2, row3, row4, row5];

// Getting columns
const col1 = document.getElementsByClassName('col1');
const col2 = document.getElementsByClassName('col2');
const col3 = document.getElementsByClassName('col3');
const col4 = document.getElementsByClassName('col4');
const col5 = document.getElementsByClassName('col5');
const col6 = document.getElementsByClassName('col6');
const cols = [col1, col2, col3, col4, col5, col6];

// Keeping track of rows
let prev = rows[0];
let curRow = 0; // Keeping track of which array index you're on for random rows.
let curCol = 0; // Keeping track of which array index you're on for random cols.

// Selected letter
let selectedKey = null;

// Shuffled rows & cols
let row_index = 0;
let col_index = 0; 
let shuffle_rows = [row1, row2, row3, row4, row5];
let shuffle_cols = [col1, col2, col3, col4, col5, col6];

// Sockets
const nlp_socket = io('http://34.73.165.89:8001'); // Socket to connect to NLP Service.
const robot_socket = io('http://localhost:8002'); // Socket to connect to RobotJS
const FLASHING_PAUSE = 300;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      statement: '',
      display: 'letters', 
      displayText: '', 
      interval : null,
      lettersFound : 0,
      rowOrder : null,
      colOrder : null,
      rowFound : false,
      colFound : false,
      predictions: ['', '', '']
    };
    this.handleNumClick = this.handleNumClick.bind(this);
    this.handleEmojiClick = this.handleEmojiClick.bind(this);
    this.handleLetterClick = this.handleLetterClick.bind(this);
    this.handlePredictions = this.handlePredictions.bind(this);
    this.writePhrase    = this.writePhrase.bind(this);
  }

  handleNumClick() {
    this.setState({ display: 'numbers' });
  }

  handleEmojiClick() {
    this.setState({ display: 'emojis' })
  }

  handleLetterClick() {
    this.setState({ display: 'letters' });
  }

  handlePredictions(...predictions) {
    this.setState({predictions : predictions})
  }

  resetKey(key) {
    if (key != null) {
      key.classList.add("entry");
      key.classList.remove("selected");
      key.classList.remove("chosen");
    }
  }

  keyChosen(key) {
    if (key != null) {
      key.classList.add("chosen");
    }
  }

  // Shuffling rows & columns
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    } 
  }
  
  writePhrase() {
    const {statement, interval, lettersFound, rowOrder, 
      colOrder, rowFound, colFound, displayText} = this.state;
    
    if (lettersFound === statement.length) {
      clearInterval(interval);
    } else {
      for (let j = 0; j < prev.length; j++) {
        this.resetKey(prev[j]);
      }
      if (selectedKey != null) {
        this.resetKey(selectedKey);
      }
      
      // Row & column selector
      let rc;

      // If a letter has been found
      if (row_index == 5 && col_index == 6) {
        // Reset indices
        row_index = 0;
        col_index = 0;
        this.shuffle(shuffle_rows);
        this.shuffle(shuffle_cols);
        this.keyChosen(selectedKey);

        // TODO: Reset numCol and numRow to -1

        // [curRow, curCol] = [0, 0];
        const newDisplay = displayText + statement[lettersFound];
        this.setState({rowFound : false, colFound : false, 
        displayText : newDisplay, lettersFound : lettersFound + 1});
        
        // Emitting an event to the socket to type letter.
        robot_socket.emit('typing', statement[lettersFound]);
        // Emitting an event to the socket to recieve word predictions.
        nlp_socket.emit("autocomplete", newDisplay, this.handlePredictions);

      } else if (row_index == 5) rc = 2;
      else if (col_index == 6) rc = 1;
      else rc = Math.floor((Math.random() * 2) + 1);
      
      // Rows
      if (rc === 1) {
        const row = shuffle_rows[row_index++];
        prev = row;
        // curRow = curRow + 1;

        for (let j = 0; j < row.length; j++) {
          row[j].classList.remove("entry");
          row[j].classList.add("selected");
          
          if (row[j].innerHTML === statement[lettersFound]) {
            if (colFound) {
              selectedKey = row[j];
              // row[j].classList.add("chosen");
            }
            // numColumSelected = j;
            // const rowOrder = getRandomArray(5);
            // curRow = 0;
            // this.setState({rowFound : true, rowOrder});
          }
        }
      } 
      // Columns
      else {
        const col = shuffle_cols[col_index++];
        prev = col;
        // curCol = curCol + 1;

        for (let j = 0; j < col.length; j++) {
          col[j].classList.remove("entry");
          col[j].classList.add("selected");
          
          // Found letter
          if (col[j].innerHTML === statement[lettersFound]) {
            if (rowFound) {
              selectedKey = col[j];
              // col[j].classList.add("chosen");
            }
            // const colOrder = getRandomArray(6);
            // curCol = 0;
            // this.setState({colFound : true, colOrder});
          }
        }
      }
    }
  }

  componentDidMount() {
    // const statement = prompt("What would you like to type?");
    const statement = "what would you like to type";
    const rowOrder = getRandomArray(5);
    const colOrder = getRandomArray(6); 
    const interval = setInterval(this.writePhrase, FLASHING_PAUSE);
    this.setState({interval, statement, rowOrder, colOrder});
  }

  /*
  get phrase from user
  pass phrase into app component
  for loop the phrase (function)
  pass the letter to letter function
  generate random rows and columns and highlight them
  check if letter in each row or column
  store in row selected and colulmn selected variables
  return letter to parent, put it on screen
  */

  render() {
    let element;
    let button2;
    let button3;
    if (this.state.display === 'letters') {
      element = <Letters />;
      button2 = <button onClick={this.handleNumClick} className="option">0</button>
      button3 = <button onClick={this.handleEmojiClick} className="option">:)</button>
    } else if (this.state.display === 'numbers') {
      element = <Numbers />;
      button2 = <button onClick={this.handleLetterClick} className="option">abc</button>
      button3 = <button onClick={this.handleEmojiClick} className="option">:)</button>
    } else {
      element = <Emojis />;
      button2 = <button onClick={this.handleNumClick} className="option">0</button>
      button3 = <button onClick={this.handleLetterClick} className="option">abc</button>
    }
	
	

    // Displaying word predictions
    const predictions = this.state.predictions.map(prediction => <button className="suggestion"> { prediction } </button>)

    return (
      <div class="keyboard-container">
        <div>
          <input type="text" className="display" value={this.state.displayText} readOnly></input>
          <div className="suggestions">
            { predictions }
          </div>
          {element}
          <div className="options">
            <button className="option">.</button>
            {button2}
            {button3}
            <button className="option">&crarr;</button>
            <button className="option">&#8678;</button>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
