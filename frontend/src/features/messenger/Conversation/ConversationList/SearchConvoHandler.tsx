import React, { useEffect, useRef, useState } from "react";
import { AppDispatch } from "../../../../store/store";
import { filterConversation } from "../conversationSlice";

interface SearchConvoHandlerProp {
  dispatch: AppDispatch;
  setHasSearch: (bool: boolean) => void;
  setSearchLoading: (bool: boolean) => void;
  searchConversation: string;
  setSearch: (n: string) => void;
}

const SearchConvoHandler = ({
  dispatch,
  setHasSearch,
  setSearchLoading,
  searchConversation,
  setSearch,
}: SearchConvoHandlerProp) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasSearch(searchConversation.length > 0);
    setSearchLoading(searchConversation.length > 0);
  }, [searchConversation]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    setSearch(input);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (input.trim()) {
      timeoutRef.current = setTimeout(async () => {
        await fetchFiltered(input);
      }, 400);
    }
  };

  const fetchFiltered = async (participantName: string): Promise<void> => {
    try {
      await dispatch(filterConversation(participantName));
    } catch (error) {
      console.log("Failed to filter convo: ", error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <input
      type="text"
      placeholder="Search chat"
      value={searchConversation}
      onChange={onChange}
    />
  );
};

export default SearchConvoHandler;
