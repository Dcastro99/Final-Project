'use strict';

const main = document.querySelector('main');


// const player = new Player(prompt('what is your name?'));
const player = new Player('Bob');

/**
 * ## Player type
 *
 * Player is the main object that holds the state of the game, and many references to other systems
 * inside like Inventory and HintSystem. This is so saving can stringify a single object and just unpack it on loading.
 */
function Player(name){
  ///Name of the player, saved in the leaderboard after the game is complete
  this.name = name;
  ///Inventory of the 
  this.inventory = null;
  this.popups = [];
  this.instantiateInventory = function(){
    this.inventory = new Inventory('[ ]');
  };
  this.instantiateInventory();
}


/// Item type! They old the name, data the img tag needs, and location it needs to render.
/// It also renders itself onto the page, but Inventory type decides when.
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

let logo = new Items('logo', '30px', '5rem');
// let laptop = new Items('laptop');
// let keyboard = new Items('keyboard');
// let mouse = new Items('mouse');
// let flashlight = new Items('flashlight');
// let backback = new Items('backback');
// let textBooks = new Items('textbooks');

/**
 * ## Inventory
 *
 * Inventory manages all Item types in the game. When the user enters the webpage for the first time
 * Inventory will load all items in existence and set them up as they were before
 */
function Inventory(stringifiedItems) {
  ///List of Item types
  this.items = reinstantiateArray(stringifiedItems, Items);
  this.render = function (){
    let ui = document.querySelector('#bottom-ui');
    ui.appendChild(document.createElement('section'));

  };
  this.render();
}

Function.prototype.

/**
 * ## HintSystem
 *
 * HintSystem manages all the hint-based functionality of the game. It renders the button for hints on the screen,
 * keeps track of the cooldown for using it
 */
function HintSystem() {
  ///how much time between asking for hints.
  this.hintCooldown = SECONDS(60);
  ///if true, you can't ask for another hint.
  this.onCooldown = false;
  ///Starts the cooldown and disables getting hints.
  this.startCooldown = function() {
    this.onCooldown = true;
    setTimeout(this.onCooldownFinished, this.hintCooldown);
  };
  ///event for when the timeout finishes, enables hint button
  this.onCooldownFinished = function() {
    this.onCooldown = false;
  };
  ///renders the button onto the page.
  this.renderHintButton = function() {
    //this needs to include an event listener that calls onHintRequested
    return;
  };
  ///function for when the button is pressed, has logic for whether the hint was allowed
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

/**
 * ## Popup
 *
 * Popups immediately create html and dim the screen when created and dim the rest of the screen until
 * dismissed, to where they clean themselves up. The inside of the Popup can really be anything rendered
 * via `renderfunction`.
 */
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

