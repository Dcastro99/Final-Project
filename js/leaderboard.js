'use strict';

<<<<<<< HEAD
=======



///Leaderboard type. Holds references to Attempts and loads them in from local storage.

>>>>>>> a92e20806a40a63e563f92a4c75dea75b03cdc37
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
