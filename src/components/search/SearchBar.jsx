import { useState } from 'react';
import FadeContent from '../ui/FadeContent';

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  filters = [],
  onFilterChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearch?.(value, activeFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
    onSearch?.(searchTerm, newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
    onSearch?.(searchTerm, {});
  };

  return (
    <FadeContent>
      <div style={{ marginBottom: '30px' }}>
        {/* Search Input */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '12px 16px 12px 45px',
                background: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '16px' }}>
              🔍
            </span>
          </div>
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {filters.map((filter) => (
              <div key={filter.key}>
                {filter.type === 'select' ? (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1a2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      minWidth: '150px',
                    }}
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1a2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  />
                ) : filter.type === 'checkbox' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#999' }}>
                    <input
                      type="checkbox"
                      checked={!!activeFilters[filter.key]}
                      onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    {filter.label}
                  </label>
                ) : null}
              </div>
            ))}

            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#e63946',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {Object.keys(activeFilters).length > 0 && (
          <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value) return null;
              const filter = filters.find((f) => f.key === key);
              const label = filter?.options?.find((o) => o.value === value)?.label || value;
              return (
                <span
                  key={key}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(230, 57, 70, 0.1)',
                    border: '1px solid #e63946',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#e63946',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {filter?.label || key}: {label}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e63946',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0',
                    }}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </FadeContent>
  );
}
