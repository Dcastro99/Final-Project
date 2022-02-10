'use strict';

//whether the popup will dismiss on a click event listen
const DISMISS_ON_CLICK = 'dismiss_on_click';
//the popup has no case for dismissing. This means the popup should have a way to deal with itself (submitting input, etc)
const DISMISS_NONE = 'dismiss_none';

///global obj of all item functions which they can point to (methods do not save across local state stringification)
const funcName2Function = {
  'genericClick': genericClick,
  'laptopClick': laptopClick,
  'flashlightClick': flashlightClick,
};
///player init populates this list with list duos (function, item ref)
///after player has inited and loaded, reTrigger events will get everything in this list...
///...and essentially run a silent event version of re-picking up the item
let queuedRetriggers = [];

//entry to the dom
const main = document.querySelector('main');
//main object- see Player doc
const player = load();

//Post hint system rendering 
postInitRender();
//save after loading player to lock in new player data on first visits

//prompt name
if(!player.name) {
  new Popup(introPopup);
}
//save after loading player to lock in new player data on first visit. note they will have no name for now, that's OK.

save();
///movement button - this has to occur AFTER player inits (inventory renders button) but BEFORE events (that touch it)
const movementButton = document.getElementById('nextRoomButton');
retriggerEvents();
//and then post player init calls
function retriggerEvents() {
  //look away, lest you lose your mind entirely.
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
    this.startDate = Date.now();
    if (window.location.pathname !== '/index.html') {
      //'index.html' will send you to the index html without the slash here
      window.location.href = 'index.html';
      return; //this will run again on the correct site
    }
    this.inventory = new Inventory();
    this.hintSystem = new HintSystem();
  } else {
    //returning player
    this.startDate = savedata.startDate;
    this.name = savedata.name;
    this.inventory = new Inventory(savedata.inventory.items);
    this.hintSystem = new HintSystem(savedata.hintCooldown, savedata.hintSystem.usedHints);
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
        //the retrigger re-collects the item, so we don't need to here.
        queuedRetriggers.push([retriggerEvent, item]);

      }
      item.render();
    }
  } else {
    //first time setup, creates all items with their default vals
    // this.items.push(new Items('logo', false, '/index.html', '30px', '5rem', 'genericClick', 'this is a hint for logo!'));
    this.items.push(new Items('laptop', false, '/index.html', '11rem', '26.5rem', 'laptopClick', 'Your laptop is on the left half.'));
    this.items.push(new Items('keyboard', false, '/classroom.html', '111rem', '22rem', 'genericClick', 'this is a hint for keyboard!'));
    this.items.push(new Items('mouse', false, '/classroom.html', '13rem', '23rem', 'genericClick', 'this is a hint for mouse!'));
    this.items.push(new Items('flashlight', false, '/index.html', '89rem', '37rem', 'flashlightClick', 'The flashlight is on the right half.'));
    this.items.push(new Items('backpack', false, '/index.html', '28rem', '43rem', 'genericClick', 'The backpack is on the top half.'));
    this.items.push(new Items('textbooks', false, '/classroom.html', '52rem', '22rem', 'genericClick', 'this is a hint for textbooks!'));
    this.items.forEach(item => item.render());
  }
  ///Adds an item from the world to the players inventory.
  this.collect = function(item) {
    item.collected = true;
    this.collected.push(item);
    item.render();
    if(win_check()) {
      return;
    }
    save();
  };
  this.render = function () {
    let tui = document.querySelector('#top-ui');
    let objectives = tui.appendChild(document.createElement('section'));
    objectives.id = 'objectives';

    let p = document.createElement('p');
    p.innerHTML =
    'Objective:'+ '<br />' + '<hr>' +
    '- Find all items in the room'+ '<br />' + '<br />' +
    '- unlock nextroom' + '<br />' + '<br />' +
    '- use hints when needed';
    let pText = objectives.appendChild(p);
    pText.id = 'objective-text';


    let a = document.createElement('a');
    a.href = '#';
    let div = document.createElement('div');
    div.textContent = 'Nextroom';
    a.id = 'nextRoomButton';
    a.appendChild(div);
    tui.appendChild(a);

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
      return;
    }
    let img = main.appendChild(document.createElement('img'));
    img.src = this.src;
    img.alt = this.name;
    img.id = this.name;
    img.classList.add('item')
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
function HintSystem(initialCooldown, usedHints) {
  ///how much time between asking for hints.
  this.hintCooldown = SECONDS(60);
  ///How many hints have been requested in total
  this.usedHints = usedHints || 0;
  ///current timer
  this.currentTimeout;
  ///when we started the cooldown
  this.hintStartTime;
  ///Starts the cooldown and disables getting hints.
  this.startCooldown = function (override) {
    let hintButton = document.querySelector('#hintButton');
    hintButton.classList.add('cooldown');
    this.currentTimeout = setTimeout(this.onCooldownFinished, override || this.hintCooldown);
    this.hintStartTime = Date.now();
  };
  ///event for when the timeout finishes, enables hint button
  this.onCooldownFinished = function () {
    let hintButton = document.querySelector('#hintButton');
    hintButton.classList.remove('cooldown');
    this.currentTimeout = undefined;
    //unlock button visually
  };
  ///renders the button onto the page.
  this.renderHintButton = function (event) {
    let tui = document.querySelector('#top-ui');
    let hintbtn = document.createElement('button');
    hintbtn.innerHTML = 'Hint Button';
    let hintGroup = tui.appendChild(document.createElement('div'));
    let hintButton = hintGroup.appendChild(hintbtn);
    hintButton.id = 'hintButton';
    hintButton.addEventListener('click', this.onHintRequested);
    let hiddendiv = hintGroup.appendChild(document.createElement('div'));
    hiddendiv.textContent = 'On cooldown right now! (Try looking for items!)';
  };
  ///function for when the button is pressed, has logic for whether the hint was allowed
  this.onHintRequested = function () {
    //this in this case is the hintbutton...
    let hintSystem = player.hintSystem;
    if(hintSystem.currentTimeout || player.popups.length) {
      return;
    }
    hintSystem.startCooldown();
    hintSystem.usedHints++;
    //list of all items it makes sense to hint at
    let possibleItemsToHint = player.inventory.items.filter(item => !player.inventory.collected.includes(item));
    //hinted at item
    let hintedAt = possibleItemsToHint[Math.floor(Math.random() * possibleItemsToHint.length)];
    //paragraph the hint will go into
    let hintP = document.querySelector('#hint');
    hintP.textContent = hintedAt.hint;

  };
  this.renderHintButton();
  if (initialCooldown) {
    this.startCooldown(initialCooldown);
  }
}

function postInitRender(){
  // Appending About us and leaderboard on the html
  let aboutUs = document.createElement('a');
  let tui = document.querySelector('#top-ui');
  aboutUs.href = '/about-us.html';
  let aboutUsButton = document.createElement('div');
  aboutUs.textContent = 'About Us';
  aboutUs.id = 'aboutUsButton';
  aboutUs.appendChild(aboutUsButton);
  tui.appendChild(aboutUs);

  let leaderBoard = document.createElement('a');
  leaderBoard.href = '/leaderboard.html';
  let leaderBoardButton = document.createElement('div');
  leaderBoard.textContent = 'Leader Board';
  leaderBoard.id = 'leaderBoardButton';
  leaderBoard.appendChild(leaderBoardButton);
  tui.appendChild(leaderBoard);

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
  this.renderListen = function() {
    main.classList.add('dimmed');
    this.section = main.appendChild(document.createElement('section'));
    this.section.classList.add('popup');
    let handleInstruction = (this.renderFunction(this.section, this));
    if(handleInstruction === DISMISS_ON_CLICK) {
      setTimeout(main.addEventListener, 5, 'click', this.onDismiss, {once: true})
    }
  };
  this.onDismiss = function(){
    main.classList.remove('dimmed');
    let popup = player.popups[0];
    console.log('popup: ', popup)
    popup.section.remove();
    popup.section = undefined;
    player.popups.shift();
  };
  this.handleName = function() {
    let popup = player.popups[0];
    let section = this.parentNode;
    let input = section.querySelector('input');
    player.name = input.value;
    popup.onDismiss();
    save();
  };
  player.popups.push(this);
  this.renderListen();
}

function test() {
  new Popup(introPopup);
}

function introPopup(section, popup) {
  let h3 = section.appendChild(document.createElement('h3'));
  let p = section.appendChild(document.createElement('p'));
 
  h3.textContent = 'This long day of coding seems to never end.';
  p.textContent = 
    'You\'re pretty sure you just destroyed your company\'s repository \
    by accident, and you\'re definitely losing your job if you can\'t \
    figure out how to undo it. Unfortunately, you\'ve lost your tools \
    and everyone else has gone home already. Go find your things, and \
    surely you\'ll overcome this horrible error.';
  let inputLabel = section.appendChild(document.createElement('label'));
  inputLabel.for = 'username';
  inputLabel.textContent = 'Your Name:';
  let input = section.appendChild(document.createElement('input'));
  input.required = 'true';
  input.type = 'text';
  input.name = 'username';
  input.id = 'username';
  let button = section.appendChild(document.createElement('button'));
  button.textContent = 'Submit';
  button.addEventListener('click', popup.handleName);
  return DISMISS_NONE; //we handle disposals with the above event listener
}

function laptopPopup(section) {
  let p = section.appendChild(document.createElement('p'));
  p.textContent = 'Your old trusty laptop! Oh, but damn. Someone took your mouse, and the keyboard was ruined by a relative a couple weeks back! (You\'ll need a new keyboard, too!)';
  return DISMISS_ON_CLICK;
}

function flashlightPopup(section) {
  let p = section.appendChild(document.createElement('p'));
  p.textContent = 'A Flashlight! While not particularly useful when it comes to coding, It will let you be able to enter the next room.';
  return DISMISS_ON_CLICK;
}

function genericClick(event, silent){
  if (!event.target.alt || player.popups.length) {
    return;
  }
  let item = player.inventory.items.filter(possible => possible.name === event.target.alt)[0];
  player.inventory.collect(item);
}

// laptop item event

function laptopClick(event, silent) {
  if (!event.target.alt || player.popups.length) {
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
  if (!event.target.alt || player.popups.length) {
    return;
  }
  if (!silent) {
    new Popup(flashlightPopup);
  }
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

///check that will immediately end the game and send a new attempt to leaderboard.html, returning false.
function win_check() {
  if(player.inventory.collected.length >= 6) {
    let completed_attempt = new Attempt(player.name, Date.now() - player.startDate, player.hintSystem.usedHints);
    localStorage.setItem('completedGame', JSON.stringify(completed_attempt));
    window.location.href = 'leaderboard.html';
    return true;
  }
  return false;
}
