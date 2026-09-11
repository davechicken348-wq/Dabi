import { useState } from 'react';
import './Search.css';

interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function Search({ onSearch, placeholder = 'Search rooms, hostels or locations…' }: SearchProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setValue('');
              onSearch('');
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}
