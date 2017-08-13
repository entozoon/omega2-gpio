'use strict';
const Omega2GPIO = require('./omega2-gpio.js'),
  gpio = new Omega2GPIO();

// Output pins (digital)
let outputA = gpio.pin(11);
let outputB = gpio.pin({
  pin: 12,
  debugging: true
});

// Set value [0, 1, true, false]
outputA.set(1);
outputB.set(true);

// Get value
console.log(outputA.get());
console.log(outputB.get());

// Input pins (digital)
let inputA = gpio.pin({
  pin: 10,
  mode: 'input'
});

// Read value synchronously
console.log('Value: ' + inputA.get());

// Read value asynchronously
inputA.getPromised().then(value => {
  console.log('Value: ' + value);
});

// Simple blink (say, if you have an LED connected to gpio pin 11)
let ledPin = gpio.pin(11),
  blink = true;
setInterval(() => {
  console.log((blink ? '^_^' : '-_-') + '\n');
  ledPin.set(blink);
  blink = !blink;
}, 500);
