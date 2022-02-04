'use strict';

function Inventory(stringifiedItems) {
  ///List of Item types
  this.items = reinstantiateArray(stringifiedItems, Item);
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
