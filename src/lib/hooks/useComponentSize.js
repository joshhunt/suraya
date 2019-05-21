import { useCallback, useState, useLayoutEffect } from "react";
import "resize-observer-polyfill";

function getSize(el) {
  if (!el) {
    return {
      width: 0,
      height: 0
    };
  }

  return {
    width: el.offsetWidth,
    height: el.offsetHeight
  };
}

export default function useComponentSize(ref) {
  let [ComponentSize, setComponentSize] = useState(
    getSize(ref ? ref.current : {})
  );

  const handleResize = useCallback(
    function handleResize() {
      if (ref.current) {
        setComponentSize(getSize(ref.current));
      }
    },
    [ref]
  );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    handleResize();

    if (typeof ResizeObserver === "function") {
      let resizeObserver = new window.ResizeObserver(() => handleResize());
      resizeObserver.observe(ref.current);

      return () => {
        resizeObserver.disconnect(ref.current);
        resizeObserver = null;
      };
    } else {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [ref.current]);

  return ComponentSize;
}
