import React, { useMemo } from "react";
import { flow, groupBy, toPairs, sortBy, mapValues, values } from "lodash/fp";

import { ARMOUR_CATEGORIES } from "src/lib/destinyEnums";
import { useDefinitions } from "src/definitionsContext";

import Item from "src/components/SmallItem";

import s from "./styles.styl";

const groupByItem = groupBy(itemWrapper => itemWrapper.instance.itemHash);

const groupItems = (items, itemDefs) =>
  useMemo(() => {
    return flow(
      groupBy(itemWrapper => {
        const itemDef = itemDefs[itemWrapper.instance.itemHash];
        return (
          ARMOUR_CATEGORIES.find(
            cat =>
              itemDef &&
              itemDef.itemCategoryHashes &&
              itemDef.itemCategoryHashes.includes(cat)
          ) || "other"
        );
      }),
      mapValues(items =>
        flow(
          sortBy(item => item.matchedPerks.length * -1),
          groupByItem,
          values,
          sortBy([l => l.length * -1, l => l[0].matchedPerks.length * -1])
        )(items)
      ),
      toPairs
    )(items);
  }, [items, itemDefs]);

export default function DupeItemList({
  items,
  selectedItems,
  onTooltip,
  onItemDeselect,
  onItemSelect,
  selectedItemHashes
}) {
  const categoryDefs = useDefinitions("ItemCategory");
  const itemDefs = useDefinitions("InventoryItem");

  const groupedItems = groupItems(items, itemDefs);

  return (
    <div className={s.itemSection}>
      {groupedItems.map(([itemCategoryHash, dupes]) => {
        const catDef = categoryDefs[itemCategoryHash];
        if (!catDef) {
          return null;
        }

        return (
          <div className={s.category}>
            <h3>{catDef.displayProperties.name}</h3>

            <div className={s.items}>
              {dupes.map(itemList => (
                <div className={s.dupeGroup}>
                  {itemList.map(itemWrapper => {
                    const { itemInstanceId, itemHash } = itemWrapper.instance;
                    const itemDef = itemDefs[itemHash];
                    const isSelected = selectedItems.includes(itemInstanceId);
                    return (
                      itemDef && (
                        <Item
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
                      )
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
