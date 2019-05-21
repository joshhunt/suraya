import memoize from "memoize-one";

function fromCharacters(characters) {
  let items = [];

  if (!characters) {
    return items;
  }

  Object.values(characters).forEach(invData => {
    items = items.concat(invData.items);
  });

  return items;
}

export default memoize(profile => {
  console.log("running getItemsFromProfile!!!");
  return [
    ...fromCharacters(profile.characterInventories.data),
    ...fromCharacters(profile.characterEquipment.data),
    ...profile.profileInventory.data.items
  ];
});
