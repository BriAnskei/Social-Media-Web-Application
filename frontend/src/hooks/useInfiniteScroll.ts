import { useRef, useEffect } from "react";

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const observeRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    if (observeRef.current) observeRef.current.disconnect();

    observeRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          callback();
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (lastElementRef.current) {
      observeRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observeRef.current) {
        observeRef.current.disconnect();
      }
    };
  }, [callback, hasMore, isLoading]);

  return lastElementRef;
}
