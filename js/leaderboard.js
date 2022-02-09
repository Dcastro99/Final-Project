'use strict';

///leaderboard obj
const leaderboard = load();

///Leaderboard type. Holds references to Attempts and loads them in from local storage.
function Leaderboard(saveData) {
  this.attempts = [];
  if(saveData) {
    //load attempts
    for(pojoAttempt of saveData.attempts) {
      let newAttempt = new Attempt(pojoAttempt.name, pojoAttempt.time, pojoAttempt.usedHints);
      this.attempts.push(newAttempt);
    }
  }
  this.checkCompletedGames = function() {
    let recieved = localStorage.getItem('completedGame');
    if(!recieved) {
      return;
    }
    recieved = JSON.parse(recieved);
    let completedGame = new Attempt(recieved.name, recieved.time, recieved.usedHints);
    this.attempts.push(completedGame);
    localStorage.removeItem('completedGame');
  };
  this.renderAttempts = function() {
    return;
  };
  this.checkCompletedGames();
  this.renderAttempts();
}

///saves leaderboard.
function save() {
  let stringifiedLB = JSON.stringify(leaderboard);
  localStorage.setItem('leaderboard', stringifiedLB);
}

///loads leaderboard and a new submission if existing
function load() {
  let recieved = localStorage.getItem('leaderboard');
  if(recieved) {
    recieved = JSON.parse(recieved);
  }
  return new Leaderboard(recieved);
}
