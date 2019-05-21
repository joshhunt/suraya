import React from 'react';
import LazyLoad from 'react-lazyload';

import Item from 'src/components/Item';

import s from './styles.styl';

function fromCharacters(characters) {
  let items = [];

  Object.values(characters).forEach(invData => {
    items = items.concat(invData.items);
  });

  return items;
}

const getAllItems = profile => {
  let items = [];

  items = items.concat(fromCharacters(profile.characterInventories.data));
  items = items.concat(fromCharacters(profile.characterEquipment.data));
  items = items.concat(profile.profileInventory.data.items);

  return items;
};

const makeItems = (profile, itemDefinitions) => {
  const ghosts = getAllItems(profile)
    .map(item => {
      const definition = itemDefinitions[item.itemHash];
      const instance = profile.itemComponents.sockets.data[item.itemInstanceId];
      const sockets = instance && instance.sockets;

      // const perks =
      //   definition.sockets &&
      //   definition.sockets.socketCategories
      //     .find(c => c.socketCategoryHash === GHOST_PERKS_SOCKET_CATEGORY)
      //     .socketIndexes.map(index => sockets[index]);

      return {
        item,
        definition,
        sockets
        // perks
      };
    })
    .sort((a, b) => (a.item.itemHash > b.item.itemHash ? -1 : 1));

  return ghosts;
};

export default function Items({ profile, itemDefinitions }) {
  const items =
    profile && itemDefinitions && makeItems(profile, itemDefinitions);

  return (
    <div>
      <h3>Items</h3>

      <div className={s.itemList}>
        {items.map(item => (
          <LazyLoad>
            <Item hash={item.item.itemHash} instance={item.item} />
          </LazyLoad>
        ))}
      </div>
    </div>
  );
}
