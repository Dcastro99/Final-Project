'Use strict';


const player = new Player(prompt('what is your name?'));
function Player(name){
  this.name = name;
  this.inventory = [];
}

function save(){
  let gameSave = JSON.stringify(player);
  localStorage.setItem('player', gameSave);
}
