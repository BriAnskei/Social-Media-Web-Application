import { useCallback } from "react";
import { Message } from "../../types/MessengerTypes";

interface LoadMoreConfig {
  hasMore: boolean;
  messages: Message[];
  conversationId: string;
  scrollRef: React.RefObject<HTMLElement>;
  lastScrollRef: React.MutableRefObject<number>;
  fetchMessages: (id: string, cursor: string) => Promise<void>;
  setIsFetchingMore: (fetching: boolean) => void;
}

export const useLoadMoreMessages = (config: LoadMoreConfig) => {
  const {
    hasMore,
    messages,
    conversationId,
    scrollRef,
    lastScrollRef,
    fetchMessages,
    setIsFetchingMore,
  } = config;

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !scrollRef.current || !conversationId) return;

    setIsFetchingMore(true);

    const scrollElement = scrollRef.current;
    lastScrollRef.current = scrollElement.scrollHeight;

    const cursor = messages[0]?.createdAt;
    if (!cursor) return;

    await fetchMessages(conversationId, cursor);

    setTimeout(() => {
      const newHeight = scrollElement.scrollHeight;
      scrollElement.scrollTop = newHeight - lastScrollRef.current;
      setIsFetchingMore(false);
    }, 0);
  }, [hasMore, messages, conversationId]);

  return loadMoreMessages;
};
