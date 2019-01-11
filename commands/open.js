'use strict';

const { Broadcast: B } = require('ranvier');
const { CommandParser } = require('@bundles/bundle-example-lib/lib/CommandParser');
const ArgParser = require('@bundles/bundle-example-lib/lib/ArgParser');
const ItemUtil = require('@bundles/bundle-example-lib/lib/ItemUtil');

module.exports = {
  aliases: ['close', 'lock', 'unlock'],
  usage: '[open/close/lock/unlock] <item> / [open/close/lock/unlock] <door direction>/ [open/close/lock/unlock] <door direction>',
  command: state => (args, player, arg0) => {
    const action = arg0.toString().toLowerCase();
    let validTarget = false;
    if (!args || !args.length) {
      return B.sayAt(player, `What do you want to ${action}?`);
    }

    if (!player.room) {
      return B.sayAt(player, 'You are floating in the nether.');
    }

    const parts = args.split(' ');

    let exitDirection = parts[0];
    if (parts[0] === 'door' && parts.length >= 2) {
      // Exit is in second parameter
      exitDirection = parts[1];
    }

    const roomExit = CommandParser.canGo(player, exitDirection);

    if (roomExit) {
      const roomExitRoom = state.RoomManager.getRoom(roomExit.roomId);
      let doorRoom = player.room;
      let targetRoom = roomExitRoom;
      let door = doorRoom.getDoor(targetRoom);
      if (!door) {
        doorRoom = roomExitRoom;
        targetRoom = player.room;
        door = doorRoom.getDoor(targetRoom);
      }

      if (door) {
        return handleDoor(player, doorRoom, targetRoom, door, action);
      }
    }

    const item = ArgParser.parseDot(args, [ ...player.inventory, ...player.room.items ]);

    if (item) {
      return handleItem(player, item, action);
    }

    return B.sayAt(player, `You don't see ${args} here.`);
  }
};

function handleDoor(player, doorRoom, targetRoom, door, action)
{
  switch (action) {
    case 'open': {
      if (door.locked) {
        return B.sayAt(player, "The door is locked.");
      }

      if (door.closed) {
        B.sayAt(player, "The door swings open.");
        return doorRoom.openDoor(targetRoom);
      }

      return B.sayAt(player, "The door is not closed.");
    }

    case 'close': {
      if (door.locked || door.closed) {
        return B.sayAt(player, "The door is already closed.");
      }

      B.sayAt(player, "The door swings closed.");
      return doorRoom.closeDoor(targetRoom);
    }

    case 'lock': {
      if (door.locked) {
        return B.sayAt(player, "The door is already locked.");
      }

      if (!door.lockedBy) {
        return B.sayAt(player, "You can't lock that door.");
      }

      const playerKey = player.hasItem(door.lockedBy);
      if (!playerKey) {
        return B.sayAt(player, "You don't have the key.");
      }

      doorRoom.lockDoor(targetRoom);
      return B.sayAt(player, '*Click* The door locks.');
    }

    case 'unlock': {
      if (!door.locked) {
        return B.sayAt(player, "It is already unlocked.");
      }

      if (door.lockedBy) {
        if (player.hasItem(door.lockedBy)) {
          B.sayAt(player, '*Click* The door unlocks.');
          return doorRoom.unlockDoor(targetRoom);
        }

        return B.sayAt(player, `The door can only be unlocked with ${keyItem.name}.`);
      }

      return B.sayAt(player, "You can't unlock that door.");
    }
  }
}

function handleItem(player, item, action)
{
  if (!item.closeable) {
    return B.sayAt(player, `${ItemUtil.display(item)} is not a container.`)
  }

  switch (action) {
    case 'open': {
      if (item.locked) {
        return B.sayAt(player, `${ItemUtil.display(item)} is locked.`);
      }

      if (item.closed) {
        B.sayAt(player, `You open ${ItemUtil.display(item)}.`);
        return item.open();
      }

      return B.sayAt(player, `${ItemUtil.display(item)} is already open, you can't open it any farther.`);
    }

    case 'close': {
      if (item.locked || item.closed) {
        return B.sayAt(player, "It's already closed.");
      }

      B.sayAt(player, `You close ${ItemUtil.display(item)}.`);

      return item.close();
    }

    case 'lock': {
      if (item.locked) {
        return B.sayAt(player, "It's already locked.");
      }

      if (!item.lockedBy) {
        return B.sayAt(player, `You can't lock ${ItemUtil.display(item)}.`);
      }

      const playerKey = player.hasItem(item.lockedBy);
      if (playerKey) {
        B.sayAt(player, `*click* You lock ${ItemUtil.display(item)}.`);

        return item.lock();
      }

      return B.sayAt(player, "The item is locked and you don't have the key.");
    }

    case 'unlock': {
      if (!item.locked) {
        return B.sayAt(player, `${ItemUtil.display(item)} isn't locked...`);
      }

      if (!item.closed) {
        return B.sayAt(player, `${ItemUtil.display(item)} isn't closed...`);
      }

      if (item.lockedBy) {
        const playerKey = player.hasItem(item.lockedBy);
        if (playerKey) {
          B.sayAt(player, `*click* You unlock ${ItemUtil.display(item)} with ${ItemUtil.display(playerKey)}.`);

          return item.unlock();
        }

        return B.sayAt(player, "The item is locked and you don't have the key.");
      }

      B.sayAt(player, `*Click* You unlock ${ItemUtil.display(item)}.`);

      return item.unlock();
    }
  }
}
