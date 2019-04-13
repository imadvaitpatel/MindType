import React, { Component } from 'react';

class EmojisSmall extends Component {
  render(){
    return (
      <div className="userInput">
        <div>
         <button className="entrySmall topLeft leftMost"><span role="img" aria-label="Emoji">😊</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😂</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😉</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😍</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😘</span></button>
         <button className="entry topRight"><span role="img" aria-label="Emoji">😋</span></button>
       </div>
       <div>
         <button className="entrySmall leftMost"><span role="img" aria-label="Emoji">😠</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😒</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😮</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😎</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😢</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">😭</span></button>
       </div>
       <div>
         <button className="entrySmall leftMost"><span role="img" aria-label="Emoji">🙈</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🙉</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🙊</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">❤️</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">💔</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🎉</span></button>
       </div>
       <div>
         <button className="entrySmall leftMost"><span role="img" aria-label="Emoji">👋</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">✌️</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">👍</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">👎</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">👏</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🙏</span></button>
       </div>
       <div>
         <button className="entrySmall leftMost"><span role="img" aria-label="Emoji">⭐</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">✨</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🔥</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">💯</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">💩</span></button>
         <button className="entrySmall"><span role="img" aria-label="Emoji">🌈</span></button>
       </div>
      </div>
    )
  }
}

export default EmojisSmall;