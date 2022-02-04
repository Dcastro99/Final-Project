'use strict';


function LeaderBoard(name, time, hints){
  this.name = name;
  this.time = time;
  this.hints = hints;
}

function save(){
  let storedData = JSON.stringify(LeaderBoard);
  localStorage.setItem('LeaderBoard', storedData);
}
