import { useState } from 'react';
import FadeContent from '../ui/FadeContent';
import ShinyButton from '../ui/ShinyButton';

export default function FilterPanel({ filters, onApply, onReset, defaultFilters = {} }) {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApply?.(activeFilters);
  };

  const handleReset = () => {
    const resetFilters = {};
    filters.forEach((filter) => {
      resetFilters[filter.key] = filter.defaultValue || '';
    });
    setActiveFilters(resetFilters);
    onReset?.(resetFilters);
  };

  const renderFilter = (filter) => {
    const value = activeFilters[filter.key] ?? filter.defaultValue ?? '';

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a0a0f',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">All</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filter.options?.map((option) => (
                <label
                  key={option.value}
                  style={{
                    padding: '6px 12px',
                    background: Array.isArray(value) && value.includes(option.value)
                      ? 'rgba(230, 57, 70, 0.2)'
                      : '#0a0a0f',
                    border: Array.isArray(value) && value.includes(option.value)
                      ? '1px solid #e63946'
                      : '1px solid #333',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleFilterChange(filter.key, newValues);
                    }}
                    style={{ display: 'none' }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        );

      case 'range':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={value[0] || filter.min}
                onChange={(e) => handleFilterChange(filter.key, [parseInt(e.target.value), value[1]])}
                placeholder="Min"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <span style={{ color: '#666' }}>to</span>
              <input
                type="number"
                value={value[1] || filter.max}
                onChange={(e) => handleFilterChange(filter.key, [value[0], parseInt(e.target.value)])}
                placeholder="Max"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a0a0f',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            />
          </div>
        );

      case 'daterange':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="date"
                value={value[0] || ''}
                onChange={(e) => handleFilterChange(filter.key, [e.target.value, value[1]])}
                placeholder="From"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              />
              <input
                type="date"
                value={value[1] || ''}
                onChange={(e) => handleFilterChange(filter.key, [value[0], e.target.value])}
                placeholder="To"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#fff' }}>{filter.label}</span>
            </label>
          </div>
        );

      case 'text':
        return (
          <div key={filter.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#999', fontWeight: '500' }}>
              {filter.label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a0a0f',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FadeContent>
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Filters</h3>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#666',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Reset All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {filters.map(renderFilter)}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ShinyButton onClick={handleReset} style={{ background: '#333' }}>
            Reset
          </ShinyButton>
          <ShinyButton onClick={handleApply}>
            Apply Filters
          </ShinyButton>
        </div>
      </div>
    </FadeContent>
  );
}
