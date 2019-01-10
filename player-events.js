'use strict';

module.exports = {
  listeners: {
    /**
     * Handle a player equipping an item with a `stats` property
     * @param {string} slot
     * @param {Item} item
     */
    equip: state => function (slot, item) {
      if (!item.metadata.stats) {
        return;
      }

      const config = {
        name: 'Equip: ' + slot,
        type: 'equip.' + slot
      };

      const effectState = {
        slot,
        stats: item.metadata.stats,
      };

      this.addEffect(state.EffectFactory.create(
        'equip',
        config,
        effectState
      ));
    }
  }
};
