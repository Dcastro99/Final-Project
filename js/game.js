'use strict';

///global obj of all item functions which they can point to (methods do not save across local state stringification)
const funcName2Function = {
  'genericClick': genericClick,
  'laptopClick': laptopClick,
  'flashlightClick': flashlightClick,
};
///
let queuedRetriggers = [];

//entry to the dom
const main = document.querySelector('main');
//main object- see Player doc
const player = load();
//save after loading player to lock in new player data on first visits
save();
///movement button - this has to occur AFTER player inits (inventory renders button) but BEFORE events (that touch it)
const movementButton = document.getElementById('nextRoomButton');
retriggerEvents();
//and then post player init calls
function retriggerEvents() {

  for(let duo of queuedRetriggers) {
    let retriggerEvent = duo[0];
    let item = duo[1];
    retriggerEvent({
      target: {alt: item.name}
    }, true);
  }
}

///saves game state.
function save() {
  //save the last updated hintCooldown we should have when the next page loads
  player.hintCooldown = Date.now() - player.hintSystem.hintStartTime;
  let gameSave = JSON.stringify(player);
  localStorage.setItem('player', gameSave);
}

///loads game state, returning a Player
function load() {
  let recieved = localStorage.getItem('player');
  if(recieved) {
    recieved = JSON.parse(recieved);
  }
  return new Player(recieved);
}


/**
 * ## Player type
 *
 * Player is the main object that holds the state of the game, and many references to other systems
 * inside like Inventory and HintSystem. This is so saving can stringify a single object and just unpack it on loading.
 */
function Player(savedata) {
  //should always be clear, who wants popups from last page?
  this.popups = [];
  if (!savedata) {
    ///first time setup
    if (window.location.pathname !== '/index.html') {
      window.location.href = 'index.html';
      return; //this will run again on the correct site
    }
    this.name = prompt('What is your name?', 'Bob');
    this.inventory = new Inventory();
    this.hintSystem = new HintSystem();
  } else {
    //returning player
    this.name = savedata.name;
    this.inventory = new Inventory(savedata.inventory.items);
    this.hintSystem = new HintSystem(savedata.hintCooldown);
  }
}

/**
 * ## Inventory
 *
 * Inventory manages all Item types in the game. When the user enters the webpage for the first time
 * Inventory will load all items in existence and set them up as they were before
 */
function Inventory(pojoItems) {
  ///List of Item types
  this.items = [];
  ///List of collected Types
  this.collected = [];
  if (pojoItems) {
    for (let pojoItem of pojoItems) {
      let item = new Items(pojoItem.name, pojoItem.collected, pojoItem.page, pojoItem.x, pojoItem.y, pojoItem.eventName, pojoItem.hint);
      this.items.push(item);
      if(item.collected) {
        let retriggerEvent = funcName2Function[item.eventName];
        queuedRetriggers.push([retriggerEvent, item]);
        this.collected.push(item);
      }
      item.render();
    }
  } else {
    //first time setup, creates all items with their default vals
    this.items.push(new Items('logo', false, '/index.html', '30px', '5rem', 'genericClick', 'this is a hint for logo!'));
    this.items.push(new Items('laptop', false, '/index.html', '3px', '8rem', 'laptopClick', 'this is a hint for laptops!'));
    this.items.push(new Items('keyboard', false, '/classroom.html', '60px', '9rem', 'genericClick', 'this is a hint for keyboard!'));
    this.items.push(new Items('mouse', false, '/classroom.html', '100px', '5rem', 'genericClick', 'this is a hint for mouse!'));
    this.items.push(new Items('flashlight', false, '/index.html', '666px', '5rem', 'flashlightClick', 'this is a hint for flashlight!'));
    this.items.push(new Items('backpack', false, '/index.html', '333px', '5rem', 'genericClick', 'this is a hint for backpack!'));
    this.items.push(new Items('textbooks', false, '/classroom.html', '555px', '5rem', 'genericClick', 'this is a hint for textbooks!'));
    this.items.forEach(item => item.render());
  }
  ///Adds an item from the world to the players inventory.
  this.collect = function(item) {
    item.collected = true;
    this.collected.push(item);
    item.render();
    save();
  };
  this.render = function () {
    let tui = document.querySelector('#top-ui');
    let objectives = tui.appendChild(document.createElement('section'));
    objectives.id = 'objectives';

    let a = document.createElement('a');
    a.href = '#';
    let div = document.createElement('div');
    div.textContent = 'Nextroom';
    a.id = 'nextRoomButton';
    a.appendChild(div);
    tui.appendChild(a);

    let hintbtn = document.createElement('button');
    hintbtn.innerHTML = 'Hint Button';
    let hintButton = tui.appendChild(hintbtn);
    hintButton.id = 'hintButton';
  };
  this.render();
}

/// Item type! They old the name, data the img tag needs, and location it needs to render.
/// It also renders itself onto the page, but Inventory type decides when.
function Items(name, collected, page, x, y, eventName, hint) {

  this.name = name;
  this.collected = collected;
  this.page = page;
  this.src = `images/${name}.png`;
  this.x = x;
  this.y = y;
  this.eventName = eventName;
  this.hint = hint;
  this.render = function () {
    //unrender the old if it exists
    let found = document.querySelector(`#${this.name}`);
    if (found) {
      found.removeEventListener('click', funcName2Function[this.eventName]);
      found.remove();
    }
    //haven't collected this, and not on this page means it shouldn't exist anywhere
    if (!this.collected && window.location.pathname !== this.page) {
      console.log(this.name, 'did not render because out of location and not collected.');
      return;
    }
    let img = main.appendChild(document.createElement('img'));
    try {
      img.src = this.src;
      img.alt = this.name;
      img.id = this.name;
    } catch (error) {
      console.warn(error, this.src);
    }
    if (this.collected) {
      // we don't have to check if querySelector did nothing because there should always be enough slots for items
      let slot = document.querySelector('.itemslot:empty');
      slot.appendChild(img);
      return;
    }
    img.addEventListener('click', funcName2Function[this.eventName]);
    img.style.cssText = `position: absolute; left: ${x}; bottom: ${y}`;
  };
}


/**
 * ## HintSystem
 *
 * HintSystem manages all the hint-based functionality of the game. It renders the button for hints on the screen,
 * keeps track of the cooldown for using it
 */
function HintSystem(initialCooldown) {
  ///how much time between asking for hints.
  this.hintCooldown = SECONDS(60);
  ///current timer
  this.currentTimeout;
  ///when we started the cooldown
  this.hintStartTime;
  ///Starts the cooldown and disables getting hints.
  this.startCooldown = function (override) {
    this.currentTimeout = setTimeout(this.onCooldownFinished, override || this.hintCooldown);
    this.hintStartTime = Date.now();
  };
  ///event for when the timeout finishes, enables hint button
  this.onCooldownFinished = function () {
    this.currentTimeout = undefined;
    //unlock button visually
  };
  ///renders the button onto the page.
  this.renderHintButton = function () {
    //this needs to include an event listener that calls onHintRequested
    return;
  };
  ///function for when the button is pressed, has logic for whether the hint was allowed
  this.onHintRequested = function (event) {
    if (this.currentTimeout) {
      return;
    }
    this.startCooldown();
    //list of all items it makes sense to hint at
    let possibleItemsToHint = player.inventory.items.filter(item => !player.inventory.collected.includes(item));
    //hinted at item
    let hintedAt = possibleItemsToHint[Math.random() * possibleItemsToHint.length];
    //paragraph the hint will go into
    let hintP = document.querySelector('#hint');
    hintP.textContent = hintedAt.hint;
    player.inventory.collected;
  };
  if (initialCooldown) {
    this.startCooldown(initialCooldown);
  }
}

/**
 * ## Popup
 *
 * Popups immediately create html and dim the screen when created and dim the rest of the screen until
 * dismissed, to where they clean themselves up. The inside of the Popup can really be anything rendered
 * via `renderfunction`.
 */
function Popup(renderFunction) {
  this.renderFunction = renderFunction;
  this.renderListen = function(){
    main.classList.add('dimmed');
    this.section = main.appendChild(document.createElement('section'));
    this.section.classList.add('popup');
    this.renderFunction(this.section);
    main.addEventListener('click', this.onDismiss);
  };
  this.onDismiss = function(){
    main.classList.remove('dimmed');
    let popup = player.popups[0];
    main.removeEventListener('click', popup.onDismiss);
    popup.section.remove();
    popup.section = undefined;
    player.popups.shift();
  };
  player.popups.push(this);
  this.renderListen();
}

function test() {
  new Popup(laptopPopup);
}

function laptopPopup(section) {
  let p = section.appendChild(document.createElement('p'));
  p.textContent = 'The laptop has no mouse, and the keyboard was ruined by a relative a couple weeks back!!!';
}

function flashlightPopup(section) {
  let p = section.appendChild(document.createElement('p'));
  p.textContent = 'With this, you\'ll be able to enter the next room.';
}

function genericClick(event, silent){
  if (!event.target.alt) {
    return;
  }
  let item = player.inventory.items.filter(possible => possible.name === event.target.alt)[0];
  player.inventory.collect(item);
}

// laptop item event

function laptopClick(event, silent) {
  if (!event.target.alt) {
    return;
  }
  if (!silent) {
    new Popup(laptopPopup);
  }
  let item = player.inventory.items.filter(possible => possible.name === 'laptop')[0];
  player.inventory.collect(item);
}
// flashlight item event

function flashlightClick(event, silent) {
  if (!event.target.alt) {
    return;
  }
  if (!silent) {
    new Popup(flashlightPopup);
  }
  console.log('hello', silent);
  console.log(movementButton);
  movementButton.className = 'clicks-allowed';
  enableDoorButton();
  let item = player.inventory.items.filter(possible => possible.name === 'flashlight')[0];
  player.inventory.collect(item);
}


function enableDoorButton() {
  let a = document.querySelector('#nextRoomButton');
  if (window.location.pathname === '/index.html') {
    a.href = '/classroom.html';
  } else {
    a.href = '/index.html';
  }
}
