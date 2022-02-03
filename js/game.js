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
    setTimeout(this.cooldownFinished, this.hintCooldown);
  };
  this.cooldownFinished = function() {
    this.onCooldown = false;
  };
}
