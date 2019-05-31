import React from "react";

import DupeItemList from "src/components/DupeItemList";

// import s from "./styles.styl";

export default function ItemComparison({
  data,
  onItemSelect,
  onItemDeselect,
  selectedItems,
  onTooltip,
  selectedItemHashes
}) {
  // function autoMark() {
  //   const singles = mappedData.reduce((acc, [_, itemsOfCategory]) => {
  //     return itemsOfCategory.reduce((acc2, itemDupes) => {
  //       if (itemDupes.length === 1) {
  //         return [...acc2, itemDupes[0].instance.itemInstanceId];
  //       }

  //       return acc2;
  //     }, acc);
  //   }, []);

  //   onItemSelect(singles);
  // }

  function autoMark() {
    window.alert("need to sort this out");
  }

  return (
    <div>
      <button onClick={autoMark}>auto mark all non-dupes</button>

      <DupeItemList
        items={data}
        selectedItems={selectedItems}
        onTooltip={onTooltip}
        onItemDeselect={onItemDeselect}
        onItemSelect={onItemSelect}
        selectedItemHashes={selectedItemHashes}
      />
    </div>
  );
}
