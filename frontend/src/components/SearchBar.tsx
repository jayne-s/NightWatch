interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-panel">
      <div style={{ width: '100%' }}>
        <label className="search-label" htmlFor="media-search">
          Search titles
        </label>
        <input
          id="media-search"
          className="search-input"
          type="search"
          value={value}
          placeholder="Search by title, notes, or stop reason"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
