import "./suggestionInput.css";
import React, { useState, useRef } from "react";
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce function to prevent excessive API calls
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

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
    setQuery(suggestion.fullName);
    setSuggestions([]);

    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  return (
    <div className="suggestion-wrapper">
      <div className="input-group mb-1">
        <form>
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            aria-label="Search"
          />
        </form>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && !loading && (
        <div className="suggestions-dropdown">
          <ul className="list-group list-group-flush">
            {suggestions.map((user) => (
              <li
                key={user._id}
                className="list-group-user list-group-item-action"
                onClick={() => handleSuggestionClick(user)}
                style={{ cursor: "pointer" }}
              >
                <div className="list-user-cont" tabIndex={0}>
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
