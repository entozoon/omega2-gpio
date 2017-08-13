'use strict';
let spawn = require('child_process').spawn;
let execSync = require('child_process').execSync;

class Omega2GpioPin {
  // Initialise the pin
  constructor(options) {
    this.pin = options.pin;
    this.mode = options.mode ? options.mode : 'output';
    this.value = null;
    this.debugging = options.debugging ? options.debugging : false;
    this.debugging && console.log(options);

    spawn('fast-gpio', ['set-' + this.mode, this.pin]);
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
    spawn('fast-gpio', ['set', this.pin, this.value]);
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
    this.frequency = options.frequency ? options.frequency : 'frequency';
    this.duty = options.duty ? options.duty : 'duty';

    // Set value physically
    spawn('fast-gpio', ['pwm', this.pin, this.frequency, this.duty]);
  }
}

class Omega2Gpio {
  // Test the system
  constructor() {
    // - No fast-gpio (unlikely, for Omega2 at least)
    spawn('fast-gpio').on('error', function() {
      console.log(' Oops!\n You must first install fast-gpio');
      process.exit();
    });
    // - Segmentation fault
    spawn('fast-gpio', ['set-output', 11]).on('error', function() {
      console.log(
        ' Oops!\n Using an Omega2? You must update the firmware by spawnning:\n  oupgrade'
      );
      process.exit();
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
