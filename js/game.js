'use strict';

const main = document.querySelector('main');


// const player = new Player(prompt('what is your name?'));
const player = new Player('Bob');
function Player(name){
  this.name = name;
  this.inventory = [];
  this.popups = [];
  this.instantiateInventory = function(){
    this.inventory = new Inventory('[]');
  };
  this.instantiateInventory();
}



function Items(name,x,y) {
  this.name = name;
  this.src = `images/${name}.png`;
  this.x = x;
  this.y = y;
  this.render = function() {
    let img = main.appendChild(document.createElement('img'));
    img.src = this.src;
    img.alt = this.name;
    img.style.cssText = `position: absolute; left: ${x}; bottom: ${y}`;
  };
  this.render();
}

let logo = new Items('logo', '500px', '25rem');
// let laptop = new Items('laptop');
// let keyboard = new Items('keyboard');
// let mouse = new Items('mouse');
// let flashlight = new Items('flashlight');
// let backback = new Items('backback');
// let textBooks = new Items('textbooks');

function Inventory(stringifiedItems) {
  ///List of Item types
  this.items = reinstantiateArray(stringifiedItems, Items);
  this.render = function (){
    // let bui = document.querySelector('#bottom-ui');
    // bui.appendChild(document.createElement('section'));
    let tui = document.querySelector('#top-ui');
    let objectives = tui.appendChild(document.createElement('section'));
    objectives.id = 'objectives';

    let a = document.createElement('a');
    if (window.location.pathname==='/index.html'){
      a.href = '/classroom.html';

    } else {
      a.href = '/index.html';
    }
    let div = document.createElement('div');
    div.textContent = 'Nextroom';
    div.id = 'nextRoomButton';
    a.appendChild(div);
    tui.appendChild(a);

    let hintbtn = document.createElement('button');
    hintbtn.innerHTML = 'Hint Button';
    let hintButton = tui.appendChild(hintbtn);
    hintButton.id = 'hintButton';

   
  };

  this.render();
}

function HintSystem() {
  this.hintCooldown = SECONDS(60);
  this.onCooldown = false;
  this.startCooldown = function() {
    this.onCooldown = true;
    setTimeout(this.onCooldownFinished, this.hintCooldown);
  };
  this.onCooldownFinished = function() {
    this.onCooldown = false;
  };
  this.renderHintButton = function() {
    //this needs to include an event listener that calls onHintRequested
    return;
  };
  this.onHintRequested = function(event) {
    if(this.onCooldown) {
      console.log('Hint Rejected, On Cooldown!');
      return;
    }
    console.log('Hint Accepted, Starting Cooldown...');
    this.startCooldown();
    return;
  };

}


function Popup(renderFunction) {
  this.dismissed = false;
  this.renderFunction = renderFunction;
  this.renderListen = function(){
    document.appendChild(document.createElement('section'));
    this.renderFunction();
  };
  this.onDismiss = function(event){
    this.dismissed = true;
    popups.filter(popup => !popup.dismissed);
  };
  player.popups.push(this);
}

