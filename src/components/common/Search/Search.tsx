import React from 'react';
import './Search.css';
interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  id?: string;
}

const Search: React.FC<SearchProps> = ({ onSearch, placeholder }) => {
  return (
    <div className="search-container">
        <input
            type="text"
            placeholder={placeholder || "Search ..."}
            className="search-input border"
            id="search-input"
            onChange={(e) => onSearch(e.target.value)}
        />	
    </div>
  );
}

export default Search;