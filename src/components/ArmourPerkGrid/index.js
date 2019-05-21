import React from 'react';

import Item from 'src/components/Item';
import ItemDetails from 'src/components/ItemDetails';
import { HELMET, ARMS, CHEST, LEGS, CLASS_ITEM } from 'src/lib/destinyEnums';

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

const WARLOCK = 2;

const ARMOUR_TYPES = [HELMET, ARMS, CHEST, LEGS, CLASS_ITEM];
const ARMOUR_PERK_SOCKET_CATEGORY = 2518356196;

const makeItems = (profile, itemDefinitions) => {
  const items = getAllItems(profile)
    .map(item => {
      const definition = itemDefinitions[item.itemHash];
      const instance = profile.itemComponents.sockets.data[item.itemInstanceId];
      const instanceSummary =
        profile.itemComponents.instances.data[item.itemInstanceId];
      const sockets = instance && instance.sockets;

      return {
        item,
        definition,
        sockets,
        instance: instanceSummary
      };
    })
    .filter(item => {
      return item.definition && item.definition.classType === WARLOCK;
    })
    .map(item => {
      const category =
        item.definition.sockets &&
        item.definition.sockets.socketCategories.find(
          c => c.socketCategoryHash === ARMOUR_PERK_SOCKET_CATEGORY
        );

      const perks =
        category && category.socketIndexes.map(index => item.sockets[index]);

      return {
        ...item,
        perks
      };
    });

  const grouped = {};

  items.forEach(item => {
    if (!grouped[item.definition.hash]) {
      grouped[item.definition.hash] = [];
    }

    grouped[item.definition.hash].push(item);
  });

  return grouped;
};

export default class ArmourPerkGrid extends React.Component {
  state = {
    compareItemHash: 554000115
  };

  compare = itemHash => {
    this.setState({ compareItemHash: itemHash });
  };

  render() {
    const { profile, itemDefinitions } = this.props;
    const { compareItemHash } = this.state;

    const groupedItems =
      profile && itemDefinitions && makeItems(profile, itemDefinitions);

    return (
      <div>
        <h3>Armour Perk Grid</h3>

        {Object.values(groupedItems)
          .filter(items => items.length > 1)
          .map(items => (
            <div className={s.itemGroup}>
              <h4>
                {items[0].definition.displayProperties.name}{' '}
                <button onClick={() => this.compare(items[0].definition.hash)}>
                  Compare
                </button>
              </h4>

              <div
                className={
                  compareItemHash === items[0].item.itemHash
                    ? s.compareList
                    : s.itemList
                }
              >
                {items.map(item =>
                  compareItemHash === item.item.itemHash ? (
                    <ItemDetails
                      definition={item.definition}
                      instanceSummary={item.item}
                      instance={item.instance}
                      perks={item.perks}
                    />
                  ) : (
                    <Item hash={item.item.itemHash} instance={item.item} />
                  )
                )}
              </div>
            </div>
          ))}
      </div>
    );
  }
}
