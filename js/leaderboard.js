'use strict';

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
