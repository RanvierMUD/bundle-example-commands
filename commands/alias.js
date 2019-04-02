"use strict";

const { Broadcast: B, Logger } = require("ranvier");
const sprintf = require("sprintf-js").sprintf;

module.exports = {
  usage: "alias [word] [command]",
  command: state => (args, player, arg0) => {
    let aliases = player.getMeta("alias") || {};

    args = args
      .toString()
      .trim()
      .toLowerCase();
    const [alias, ...commandArgs] = args.split(" ");

    if (!alias && commandArgs.length === 0) {
      /**
       * prints defined alias list
       */
      B.sayAt(
        player,
        sprintf("<cyan>%-20s</cyan> | <cyan>%-57s</cyan>", "Alias", "Command")
      );
      B.sayAt(player, B.line(20) + "-+-" + B.line(57));

      if (!aliases || Object.entries(aliases).length === 0) {
        return B.sayAt(player, "No aliases defined yet!");
      }

      for (let [key, value] of Object.entries(aliases)) {
        B.sayAt(player, sprintf("%-20s | %-57s", key, value));
      }
    }

    if (alias && commandArgs.length === 0) {
      /**
       * drop alias
       */
      if (aliases && aliases[alias]) {
        delete aliases[alias];
        player.setMeta("alias", aliases);
        player.save();

        return B.sayAt(player, `Alias '${alias}' deleted!`);
      }

      return B.sayAt(player, `Alias '${alias}' not found!`);
    }

    if (alias && commandArgs.length > 0) {
      /**
       * Add or update alias with args
       */
      if (aliases && aliases[alias]) {
        return B.sayAt(player, `Alias '${alias}' updated!`);
      }

      aliases[alias] = commandArgs.join(" ");
      player.setMeta("alias", aliases);
      player.save();

      return B.sayAt(player, `Alias '${alias}' added!`);
    }
  }
};
