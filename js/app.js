

  

// Helpers

///Takes a number in seconds and multiplies it to its value in miliseconds
function SECONDS(num) {
  return num * 1000;
}

///Takes a stringified array and returns an array with all objects inside it reinstantiated
function reinstantiateArray(stringifiedArray, Type) {
  //items of the Item type
  let loadedItems = [];
  //plain old javascript objects
  let parsedItems = JSON.parse(stringifiedArray);
  for(let pojo of parsedItems) {
    loadedItems.push(new Type(pojo));
  }
  return loadedItems;
}

