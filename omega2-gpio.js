'use strict';
let spawn = require('child_process').spawn,
  execSync = require('child_process').execSync,
  allowSpawn = true;

class Omega2GpioPin {
  // Initialise the pin
  constructor(options) {
    this.pin = options.pin;
    this.mode = options.mode ? options.mode : 'output';
    this.value = null;
    this.debugging = options.debugging ? options.debugging : false;
    this.debugging && console.log(options);

    allowSpawn && allowSpawn && spawn('fast-gpio', ['set-' + this.mode, this.pin]);
  }

  // Set the value (digital)
  set(value) {
    // Convert booleans to numeric
    if (value === true) value = 1;
    else if (value === false) value = 0;

    // Set value locally for the instance
    this.value = value;
    this.debugging && console.log('Pin ' + this.pin + ' write: ' + this.value);

    // Set value physically
    allowSpawn && spawn('fast-gpio', ['set', this.pin, this.value]);
  }

  // Get the value (digital)
  get() {
    // Set value locally
    if (this.mode == 'input') {
      this.value = this.parseRead(execSync('fast-gpio read ' + this.pin).toString());
    }
    this.debugging && console.log('Pin ' + this.pin + ' read:  ' + this.value);

    // Return value
    return this.value;
  }

  // Get the value asynchronously as a promise
  getPromised() {
    let _this = this;
    return new Promise((resolve, reject) => {
      allowSpawn &&
        spawn('fast-gpio', ['read', this.pin]).stdout.on('data', data => {
          this.debugging && console.log('Pin ' + this.pin + ' read:  ' + this.value);
          // Set value locally
          _this.value = _this.parseRead(data.toString());

          // Return resolve state
          resolve(_this.value);
        });
    });
  }

  // Translate fast-gpio output (digital)
  parseRead(data) {
    // "> Read GPIO13: 1" -> 1
    return parseInt(data.slice(data.indexOf(':') + 2).trim());
  }

  pwm(options) {
    // Set value locally for the instance
    this.value = null;
    this.frequency = options.frequency;
    this.duty = options.duty;

    this.debugging &&
      console.log('Pin ' + this.pin + ' PWM: ' + this.frequency + 'hz @ ' + this.duty + '%');

    // Set value physically
    allowSpawn && spawn('fast-gpio', ['pwm', this.pin, this.frequency, this.duty]);
  }
}

class Omega2Gpio {
  // Test the system
  constructor() {
    this.fastGpioTested = false;

    // These should be rewritten as individual promises

    // - No fast-gpio (unlikely, on Omega2 at least, but more for local dev)
    spawn('fast-gpio')
      .on('exit', () => {
        this.fastGpioTested = true;
      })
      .on('error', () => {
        this.fastGpioTested = true;
        allowSpawn = false;
        console.log(' Oops!\n You must first install fast-gpio to give us control of the pins');
      });

    // - Segmentation fault
    spawn('fast-gpio', ['set-output', 11])
      .on('exit', () => {
        this.fastGpioTested = true;
      })
      .on('error', () => {
        this.fastGpioTested = true;
        allowSpawn = false;
        console.log(
          ' Oops!\n Using an Omega2? You must update the firmware by running:\n   oupgrade'
        );
      });
  }

  tests() {
    // Polling isn't the best solution but will do okay for now
    return new Promise((resolve, reject) => {
      let count = 0,
        testInterval = setInterval(() => {
          if (this.fastGpioTested) {
            clearInterval(testInterval);
            resolve();
          }
          if (count > 12) {
            clearInterval(testInterval);
            resolve();
          }
        }, 250);
    });
  }

  pin(options) {
    // If only a pin number is provided, pass it through nicely
    if (typeof options !== 'object') {
      options = { pin: options };
    }
    return new Omega2GpioPin(options);
  }
}

module.exports = Omega2Gpio;
