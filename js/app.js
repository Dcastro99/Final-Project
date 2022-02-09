
'Use strict';

// Helpers

///Takes a number in seconds and multiplies it to its value in miliseconds
function SECONDS(num) {
  return num * 1000;
}

///Attempt type, just holds the score of the run. Held and rendered by leaderboard.
function Attempt(name, time, usedHints) {
  this.name = name;
  this.time = time;
  this.usedHints = usedHints;
}
