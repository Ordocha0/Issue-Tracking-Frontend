import React, { useState, useEffect, useRef } from "react";
import style from "./index.module.css"; 
import { fetchUserData } from "../../Components/titan.js"; 
import ClipLoader from "react-spinners/ClipLoader";

const SearchClients = ({ token, setSearchedClient }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const data = await fetchUserData(token, `accounts/search-clients?client_name=${query}`);
          const searchResults = Array.isArray(data) ? data : data.results || [];
          setResults(searchResults);
          setShowDropdown(true);
        } catch (err) {
          console.error("Search failed", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  const handleSelect = (client) => {
    // Catch nulls when building the display name
    const firstName = client?.first_name || "";
    const lastName = client?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Unknown Client";
    
    setQuery(fullName);
    setSearchedClient(client); 
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className={style.searchWrapper} ref={dropdownRef}>
      <div className={style.inputContainer}>
        <input
          type="text"
          className={style.enhancedInput} 
          placeholder="Search client name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && results.length > 0 && setShowDropdown(true)}
        />
        <div className={style.loaderPos}>
          <ClipLoader color="#50C878" loading={loading} size={18} />
        </div>
      </div>
      
      {showDropdown && results.length > 0 && (
        <ul className={style.youtubeDropdown}>
          {results.map((client) => {
            // SAFE NULL CHECKING FOR INITIALS
            const fInitial = client?.first_name?.charAt(0) || "?";
            const lInitial = client?.last_name?.charAt(0) || "";
            
            return (
              <li 
                key={client?.id || Math.random()} 
                onClick={() => handleSelect(client)}
                className={style.dropdownItem}
              >
                <div className={style.resultItem}>
                  <div className={style.avatarCircle}>
                      {fInitial}{lInitial}
                  </div>
                  <div className={style.clientInfo}>
                    <span className={style.clientName}>
                      {client?.first_name || "N/A"} {client?.last_name || ""}
                    </span>
                    <span className={style.clientMeta}>
                      {client?.phone_number || "No Phone"} • {client?.estate || "No Estate"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchClients;