'use strict';

<<<<<<< HEAD

function LeaderBoard(name, time, hints){
  this.name = name;
  this.time = time;
  this.hints = hints;
}



///Leaderboard type. Holds references to Attempts and loads them in from local storage.
=======
>>>>>>> 92de21eff3b1448508b0a23ebb53760e59426e64
function Leaderboard(stringifiedAttempts) {
  this.attempts = reinstantiateArray(stringifiedAttempts, Attempt);
  this.renderAttempts = function() {
    return;
  };
}

///Attempt type, just holds the score of the run. Held and rendered by leaderboard.
function Attempt(name, time, usedHints) {
  this.name = name;
  this.time = time;
  this.usedHints = usedHints;
}
