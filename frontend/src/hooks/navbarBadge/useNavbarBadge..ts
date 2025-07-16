import { useState, useEffect } from "react";

export const useNavbarBadge = (
  hasNotification: boolean,
  fadeInDelay = 10,
  fadeOutDuration = 900
) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasNotification) {
      // Show badge: render first, then make visible with delay
      setShouldRender(true);
      setIsVisible(false);

      const fadeInTimer = setTimeout(() => {
        setIsVisible(true);
      }, fadeInDelay);

      return () => clearTimeout(fadeInTimer);
    } else {
      // Hide badge: fade out first, then stop rendering
      setIsVisible(false);
      setShouldRender(true);

      const fadeOutTimer = setTimeout(() => {
        setShouldRender(false);
      }, fadeOutDuration);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [hasNotification, fadeInDelay, fadeOutDuration]);

  return { shouldRender, isVisible };
};
