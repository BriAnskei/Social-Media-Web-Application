import React, { useEffect, useRef, useState } from "react";

const SearchConvoHandler = () => {
  const [searchConversation, setSearch] = useState<string>("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearch(input);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (input.trim()) {
      timeoutRef.current = setTimeout(() => {
        filterConversations(input);
      }, 400);
    }
  };

  const filterConversations = async (
    participantName: string
  ): Promise<void> => {
    try {
      console.log("FIlter conversation: ", participantName);

      // call the fetcher
    } catch (error) {
      console.log("Failed to filter convo: ", error);
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
