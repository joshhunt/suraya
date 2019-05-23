import { uniq, isArray } from "lodash";

const INITIAL_STATE = {
  selectedPerks: [],
  selectedItems: []
};

const ADD_SELECTED_PERK = "Add selected perk";
const REMOVE_SELECTED_PERK = "Remove selected perk";

const ADD_SELECTED_ITEM = "Add selected item";
const REMOVE_SELECTED_ITEM = "Remove selected item";

const asArray = item => (isArray(item) ? item : [item]);
const add = (existing, item) => uniq([...existing, ...asArray(item)]);
const remove = (existing, item) => existing.filter(i => i !== item);

export default function perkToolReducer(
  state = INITIAL_STATE,
  { type, payload }
) {
  switch (type) {
    case ADD_SELECTED_PERK:
      return {
        ...state,
        selectedPerks: add(state.selectedPerks, payload)
      };

    case REMOVE_SELECTED_PERK:
      return {
        ...state,
        selectedPerks: remove(state.selectedPerks, payload)
      };

    case ADD_SELECTED_ITEM:
      return {
        ...state,
        selectedItems: add(state.selectedItems, payload)
      };

    case REMOVE_SELECTED_ITEM:
      return {
        ...state,
        selectedItems: remove(state.selectedItems, payload)
      };

    default:
      return state;
  }
}

export function addSelectedPerk(perk) {
  return {
    type: ADD_SELECTED_PERK,
    payload: perk
  };
}

export function removeSelectedPerk(perk) {
  return {
    type: REMOVE_SELECTED_PERK,
    payload: perk
  };
}

export function addSelectedItemInstance(perk) {
  return {
    type: ADD_SELECTED_ITEM,
    payload: perk
  };
}

export function removeSelectedItemInstance(perk) {
  return {
    type: REMOVE_SELECTED_ITEM,
    payload: perk
  };
}
