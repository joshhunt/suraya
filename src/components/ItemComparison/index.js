import React from "react";
import { flow, values, sortBy, toPairs, map, groupBy } from "lodash/fp";

import Item from "src/components/SmallItem";

import { useDefinitions } from "src/definitionsContext";

import s from "./styles.styl";

const groupByItem = groupBy(itemWrapper => itemWrapper.instance.itemHash);

export default function ItemComparison({
  data,
  onItemSelect,
  onItemDeselect,
  selectedItems,
  onTooltip,
  selectedItemHashes
}) {
  const categoryDefs = useDefinitions("ItemCategory");
  const itemDefs = useDefinitions("InventoryItem");

  const mappedData = flow(
    toPairs,
    map(([itemCategoryHash, items]) => [
      itemCategoryHash,
      flow(
        sortBy(item => item.matchedPerks.length * -1),
        groupByItem,
        values,
        sortBy([l => l.length * -1, l => l[0].matchedPerks.length * -1])
      )(items)
    ])
  )(data);

  function autoMark() {
    const singles = mappedData.reduce((acc, [_, itemsOfCategory]) => {
      return itemsOfCategory.reduce((acc2, itemDupes) => {
        if (itemDupes.length === 1) {
          return [...acc2, itemDupes[0].instance.itemInstanceId];
        }

        return acc2;
      }, acc);
    }, []);

    onItemSelect(singles);
  }

  return (
    <div>
      <button onClick={autoMark}>auto mark all non-dupes</button>
      {mappedData.map(([itemCategoryHash, itemGroups]) => {
        const catDef = categoryDefs[itemCategoryHash];

        if (!catDef) {
          return null;
        }

        return (
          <div className={s.category}>
            <h3>{catDef.displayProperties.name}</h3>

            <div className={s.items}>
              {itemGroups.map(items => (
                <div className={s.dupeGroup}>
                  {items.map(itemWrapper => {
                    const { itemInstanceId, itemHash } = itemWrapper.instance;
                    const isSelected = selectedItems.includes(itemInstanceId);
                    const itemDef = itemDefs[itemHash];

                    if (!itemDef) {
                      return null;
                    }

                    return (
                      <Item
                        matchedPerksThreshold={1}
                        onTooltipEnter={ev => onTooltip(ev, itemWrapper)}
                        onTooltipLeave={() => onTooltip(null)}
                        onClick={() =>
                          isSelected
                            ? onItemDeselect(itemInstanceId)
                            : onItemSelect(itemInstanceId)
                        }
                        isSelected={isSelected}
                        isDupe={
                          !isSelected && selectedItemHashes.includes(itemHash)
                        }
                        key={itemInstanceId}
                        item={itemDef}
                        itemWrapper={itemWrapper}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
