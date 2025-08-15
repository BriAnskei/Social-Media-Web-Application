import { useRef, useCallback, useEffect } from "react";

export function useScrollResoration() {
  const lastScrollRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    lastScrollRef.current = document.documentElement.scrollTop;
  }, []);

  useEffect(() => {
    const lastScroll = sessionStorage.getItem("lastScrollPoint");
    if (lastScroll) {
      sessionStorage.clear();
      lastScrollRef.current = parseInt(lastScroll);
      setTimeout(() => {
        document.documentElement.scrollTo({
          top: parseInt(lastScroll),
          behavior: "instant",
        });
      }, 0);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sessionStorage.setItem(
        "lastScrollPoint",
        lastScrollRef.current.toString()
      );
    };
  }, []);
}
