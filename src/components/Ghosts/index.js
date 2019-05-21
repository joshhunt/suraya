import React from 'react';
import { memoize, groupBy } from 'lodash';

import { GHOST } from 'src/lib/destinyEnums';

const GHOST_PERKS_SOCKET_CATEGORY = 3301318876;

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

const getGhosts = (profile, itemDefinitions) => {
  const ghosts = getAllItems(profile)
    .filter(item => {
      const def = itemDefinitions[item.itemHash];

      return def.itemCategoryHashes.includes(GHOST);
    })
    .map(item => {
      const definition = itemDefinitions[item.itemHash];
      const instance = profile.itemComponents.sockets.data[item.itemInstanceId];
      const sockets = instance && instance.sockets;

      const perks = definition.sockets.socketCategories
        .find(c => c.socketCategoryHash === GHOST_PERKS_SOCKET_CATEGORY)
        .socketIndexes.map(index => sockets[index]);

      return {
        item,
        definition,
        sockets,
        perks
      };
    });

  console.log('ghosts:', ghosts);

  return ghosts;
};

const GHOST_PERK = 4176831154;

export default function Ghosts({ profile, itemDefinitions }) {
  const ghostData =
    profile && itemDefinitions && getGhosts(profile, itemDefinitions);

  const comboDetectors = Object.values(itemDefinitions)
    .filter(def => {
      return (
        def.itemCategoryHashes && def.itemCategoryHashes.includes(GHOST_PERK)
      );
    })
    .filter(def => def.displayProperties.name.includes('Combo Detector'));

  const comboDetectorHashes = comboDetectors.map(d => d.hash);

  const ghostsByComboDetector = groupBy(ghostData, ghost => {
    const perk = ghost.perks.find(perk =>
      comboDetectorHashes.includes(perk.plugHash)
    );

    return perk && perk.plugHash;
  });

  console.log('ghostsByComboDetector:', ghostsByComboDetector);

  return (
    <div>
      <h3>Ghosts</h3>

      <ul>
        {comboDetectors.map(def => {
          const theseGhosts = ghostsByComboDetector[def.hash];

          return (
            <li>
              {def.displayProperties.name}
              <ul>
                {theseGhosts &&
                  theseGhosts.map(ghost => (
                    <li>
                      <div>{ghost.definition.displayProperties.name}</div>
                      <ul>
                        {ghost.perks.map(perk => {
                          const perkDef = itemDefinitions[perk.plugHash];
                          return <li>{perkDef.displayProperties.name}</li>;
                        })}
                      </ul>
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
