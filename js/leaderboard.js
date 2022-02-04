
'use strict';


function LeaderBoard(name, time, hints){
  this.name = name;
  this.time = time;
  this.hints = hints;
}




function Leaderboard(stringifiedAttempts) {
  this.attempts = reinstantiateArray(stringifiedAttempts, Attempt);
  this.renderAttempts = function() {
    return;
  };
}

function Attempt(name, time, usedHints) {
  this.name = name;
  this.time = time;
  this.usedHints = usedHints;

}
