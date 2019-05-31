import React, { useState } from "react";

import Character from "src/components/Character";

import s from "./styles.styl";

export default function HeadingWithTransfers({ children, profile }) {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className={s.root}>
      <h3 className={s.heading}>{children}</h3>

      <div className={s.accessory}>
        <button onClick={() => setShowDrawer(!showDrawer)} type="button">
          Transfer
        </button>
      </div>

      {showDrawer && profile && (
        <div className={s.transferDrawer}>
          {Object.values(profile.characters.data).map(character => (
            <button className={s.transferCharacter} key={character.characterId}>
              <Character character={character} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
