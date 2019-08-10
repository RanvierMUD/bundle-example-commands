'use strict';

const { Broadcast: B } = require('ranvier');

/* To implement a modal command (specifically via the example-input-events bundle)
 * have your command's function return a value. That value will put the player in that
 * command state. Subsequent input from the player will be passed directly to this command
 * with all input as `args` and the current state as the 4th argument after arg0. */
module.exports = {
  usage: 'modaltest',
  command: state => (args, player, arg0, commandState) => {
    args = args.trim();

    if (!commandState) {
      B.sayAt(player, 'This is a test of a modal command');
      B.at(player, 'Please choose (a) or (b): ');
      return 'choose';
    }

    switch (commandState) {
      case 'choose': {
        if (!(['a', 'b'].includes(args.toLowerCase()))) {
          B.sayAt(player, 'Not a valid choice.');
          B.at(player, 'Please choose (a) or (b): ');
          return 'choose';
        }

        B.sayAt(player, `You chose [${args}]. Hooray!`);
      }
    }
  }
};

