import { useState, useEffect } from "react";

// Tracks whether the viewport is too small to comfortably play the Dungeon
// Crawler (its grid uses fixed 32px tiles, so a phone screen can't show the
// dungeon). Used in Home.jsx and VillageGame.jsx to warn mobile players that
// the mode isn't available on small screens yet.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    update();
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [breakpoint]);

  return isMobile;
}
