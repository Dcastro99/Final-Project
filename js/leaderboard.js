'use strict';

///leaderboard obj
const leaderboard = load();
//if anything was added, we want to save that.
save();

///Leaderboard type. Holds references to Attempts and loads them in from local storage.
function Leaderboard(saveData) {
  this.attempts = [];
  if(saveData) {
    //load attempts
    for(let pojoAttempt of saveData.attempts) {
      let newAttempt = new Attempt(pojoAttempt.name, pojoAttempt.time, pojoAttempt.usedHints);
      this.attempts.push(newAttempt);
    }
  }
  this.checkCompletedGames = function() {
    let recieved = localStorage.getItem('completedGame');
    if(!recieved) {
      //rephrase the button to just return to the game
      let indexLink = document.querySelector('#reset > a');
      indexLink.textContent = 'Back to the game!';
      return;
    }
    recieved = JSON.parse(recieved);
    let completedGame = new Attempt(recieved.name, recieved.time, recieved.usedHints);
    this.attempts.push(completedGame);
    localStorage.removeItem('completedGame');
    localStorage.removeItem('player');
  };
  this.renderAttempts = function() {
    if(!this.attempts.length) {
      return
    }
    let attemptBoxes = document.querySelector('#attempts-flex');
    attemptBoxes.innerHTML = ''
    this.attempts.forEach(attempt => {
      let attemptBox = attemptBoxes.appendChild(document.createElement('div'));
      attemptBox.classList.add('attemptBox');
      let name = attemptBox.appendChild(document.createElement('p'));
      name.textContent = attempt.name;
      let timeTaken = attemptBox.appendChild(document.createElement('p'));
      let time = new Date(attempt.time);
      timeTaken.textContent = `${time.getMinutes()} minutes, ${time.getSeconds()} seconds`;
      let hintsUsed = attemptBox.appendChild(document.createElement('p'));
      hintsUsed.textContent = attempt.usedHints || 'No hints used!';
    });
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

function test(amt = 1) {
  for(let i = 0; i < amt; i++) {
    leaderboard.attempts.push(new Attempt(`Debug${Math.round(Math.random() * 100)}`, Date.now(), 2));
    let attemptBoxes = document.querySelector('#attempts-flex');
    attemptBoxes.innerHTML = ''
    leaderboard.renderAttempts()
    save();
  }
}
