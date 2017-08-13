# Omega2 GPIO
Control Onion Omega2 GPIO pins from Node (fast-gpio wrapper).

## Installing all the things
## Dependencies
Firstly upgrade the firmware (as fast-gpio was knackered in the first few generations) then the other dependencies:

    oupgrade
    opkg update
    opkg install nodejs
    opkg install npm

### Add this module to your project
    npm install --save omega2-gpio

## Usage
```javascript
'use strict';
const Omega2GPIO = require('omega2-gpio'),
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
let blinkInterval = setInterval(() => {
  console.log((blink ? '^_^' : '-_-') + '\n');
  ledPin.set(blink);
  blink = !blink;
}, 500);

// Stop blinking after a while
setTimeout(() => {
  clearInterval(blinkInterval);

  // PWM output
  ledPin.pwm({
    frequency: 5, // hz
    duty: 75 // percentage (0 -> 100)
  });
}, 4000);
```
