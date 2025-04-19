import "./suggestionInput.css";
import React, { useState, useRef, useEffect } from "react";
import Spinner from "../Spinner/Spinner";
import { FetchedUserType } from "../../types/user";
import { userApi } from "../../utils/api";

interface Prop {
  onSelect?: (item: FetchedUserType) => void;
  placeholder?: string;
}

const SuggestionInput: React.FC<Prop> = ({
  onSelect,
  placeholder = "Search...",
}) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<FetchedUserType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce function to prevent excessive API calls
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1); // Reset active index when input changes

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only make API call if input has content
    if (value.trim()) {
      setLoading(true);
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // 300ms delay
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const res = await userApi.searchRedex(searchQuery);

      if (res.success) {
        console.log("searched user: ", res.user!);
        setSuggestions(res.user! as FetchedUserType[]);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error fetching suggestions");
    }
  };

  const handleSuggestionClick = (suggestion: FetchedUserType) => {
    setQuery("");
    setSuggestions([]);

    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Key event handler for arrow
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If there are no suggestions, don't do anything

    if (!suggestions.length) {
      if (e.key === "Escape") setQuery("");
      return;
    }

    // Handle arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    }

    // Handle arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    }

    // Handle enter
    else if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSuggestionClick(suggestions[activeIndex]);
      }
    }

    // Handle escape to close suggestions
    else if (e.key === "Escape") {
      setQuery("");
      setSuggestions([]);
      setActiveIndex(-1);
      inputRef.current?.blur(); // remmove the fucos in the input
    }
  };

  // Scroll active item into view when navigating with keyboard
  useEffect(() => {
    if (activeIndex >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.querySelector(
        `.list-group-user:nth-child(${activeIndex + 1})`
      ) as HTMLElement;

      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
        // activeElement.scrollIntoView({ block: "nearest", inline: "nearest" }) scrolls the element into view smoothly:

        // block: "nearest": Vertically aligns the element to the nearest edge of the container.

        // inline: "nearest": Horizontally aligns the element to the nearest edge of the container.
      }
    }
  }, [activeIndex]);

  const onBlur = () => {
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.blur(); // remmove the fucos in the input
  };

  return (
    <div className="suggestion-wrapper">
      <div className="input-group mb-1">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            aria-label="Search"
            aria-expanded={suggestions.length > 0}
            aria-autocomplete="list"
            aria-controls={
              suggestions.length > 0 ? "search-suggestions" : undefined
            }
            aria-activedescendant={
              activeIndex >= 0
                ? `suggestion-${suggestions[activeIndex]?._id}`
                : undefined
            }
          />
        </form>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && !loading && (
        <div
          ref={suggestionsRef}
          className="suggestions-dropdown"
          id="search-suggestions"
          role="listbox"
        >
          <ul className="list-group list-group-flush">
            {suggestions.map((user, index) => (
              <li
                key={user._id}
                id={`suggestion-${user._id}`}
                className={`list-group-user list-group-item-action ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={() => handleSuggestionClick(user)}
                onMouseEnter={() => setActiveIndex(index)}
                style={{ cursor: "pointer" }}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div className="list-user-cont" tabIndex={-1}>
                  <img
                    src={`http://localhost:4000/uploads/profile/${user._id}/${user.profilePicture}`}
                    alt=""
                  />
                  {user.fullName} ({user.username})
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="search-loading">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default SuggestionInput;
