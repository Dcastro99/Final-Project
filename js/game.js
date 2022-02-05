'use strict';

//entry to the dom
const main = document.querySelector('main');
//main object- see Player doc
const player = load();

///saves game state.
function save(){
  //save the last updated hintCooldown we should have when the next page loads
  player.hintCooldown = new Date().now() - player.hintSystem.hintStartTime
  let gameSave = JSON.stringify(player);
  localStorage.setItem('player', gameSave);
}

///loads game state, returning a Player
function load(){
  let recieved = localStorage.getItem('player');
  recieved = JSON.parse(recieved);
  return new Player(recieved);
}

function Player(savedata){
  //should always be clear, who wants popups from last page?
  this.popups = [];
  if(!savedata) {
    ///first time setup
    if(window.location.pathname != '/index.html') {
      window.location.href = 'index.html';
      return; //this will run again on the correct site
    }
    this.name = prompt('What is your name?', 'Bob');
    this.inventory = new Inventory();
  } else {
    //returning player
    this.name = savedata.name;
    this.inventory = new Inventory(pojoInventory.items);
    this.hintSystem = new HintSystem(savedata.hintCooldown)
  }
}

function Inventory(pojoItems) {
  ///List of Item types
  this.items = [];
  ///List of collected Types
  this.collected = [];
  if(pojoItems) {
    for(let pojoItem of pojoItems) {
      let item = new Items(pojoItem.name, pojoItem.collected, pojoItem.page, pojoItem.x, pojoItem.y);
      item.render();
      this.items.push(item);
    }
  } else {
    //first time setup, creates all items with their default vals
    this.items.push(new Items('logo', false, 'index.html', '30px', '5rem', laptopClick));
    // items.push(new Items('laptop'));
    // items.push(new Items('keyboard'));
    // items.push(new Items('mouse'));
    // items.push(new Items('flashlight'));
    // items.push(new Items('backback'));
    // items.push(new Items('textbooks'));
  }
  this.render = function() {
    let ui = document.querySelector('#bottom-ui');
    ui.appendChild(document.createElement('section'));
  };
  this.render();
}

function Items(name, collected, page, x, y, eventCallback) {
  this.name = name;
  this.collected = collected;
  this.page = page;
  this.src = `images/${name}.png`;
  this.x = x;
  this.y = y;
  this.eventCallback = eventCallback;
  this.render = function() {
    //unrender the old if it exists
    let found = document.querySelector(`#${this.name}`);
    if(found) {
      found.removeEventListener('click', this.eventCallback);
      found.remove();
    }
    //haven't collected this, and not on this page means it shouldn't exist anywhere
    if(!collected && window.location.href != this.page) {
      return;
    }
    let img = main.appendChild(document.createElement('img'));
    img.src = this.src;
    img.alt = this.name;
    img.id = this.name;
    if(collected) {
      //we don't have to check if querySelector did nothing because there should always be enough slots for items
      //let slot = document.querySelector('.itemslot:empty');
      //slot.appendChild(img);
      return
    }
    img.addEventListener('click', this.eventCallback);
    img.style.cssText = `position: absolute; left: ${x}; bottom: ${y}`;
  };
}

 let logo = new Items('logo', '500px', '25rem');
 let laptop = new Items('laptop', '50px', '25rem');
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

function HintSystem(initialCooldown) {
  this.hintCooldown = SECONDS(60);
  ///current timer
  this.currentTimeout;
  ///when we started the cooldown
  this.hintStartTime;
  this.startCooldown = function(override) {
    this.currentTimeout = setTimeout(this.onCooldownFinished, override || this.hintCooldown);
    this.hintStartTime = new Date().now()
  };
  this.onCooldownFinished = function() {
    this.currentTimeout = undefined;
    //unlock button visually
  };
  this.renderHintButton = function() {
    //this needs to include an event listener that calls onHintRequested
    return;
  };
  this.onHintRequested = function(event) {
    if(this.currentTimeout) {
      console.log('Hint Rejected, On Cooldown!');
      return;
    }
    console.log('Hint Accepted, Starting Cooldown...');
    this.startCooldown();
    return;
  };
  if(initialCooldown) {
    this.startCooldown(initialCooldown)
  }
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

// laptop item event

function laptopClick(event) {
  let itemClicked = event.target.alt;
  if (itemClicked === 'laptop') {
    alert ('The laptop has no mouse, and the keyboard was ruined by a relative a couple weeks back!!!');
  }
  player.inventory.collected.push();
  let item = player.inventory.items.filter(possible => possible.name ==='laptop')[0];
  item.render();
}


