import { useState, useMemo } from 'react';
import ShinyButton from '../ui/ShinyButton';
import FadeContent from '../ui/FadeContent';

export default function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  pagination = true,
  pageSize = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((row) => row.id));
    }
  };

  const renderCell = (row, column) => {
    const value = row[column.key];
    if (column.render) return column.render(value, row);
    return value;
  };

  return (
    <FadeContent>
      <div style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header with Actions */}
        <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Showing {paginatedData.length} of {sortedData.length} entries
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedRows.length > 0 && (
              <ShinyButton style={{ padding: '8px 16px', fontSize: '13px' }}>
                Delete Selected ({selectedRows.length})
              </ShinyButton>
            )}
            <ShinyButton style={{ padding: '8px 16px', fontSize: '13px', background: '#333' }}>
              Export
            </ShinyButton>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#0a0a0f', borderBottom: '2px solid #333' }}>
                <th style={{ padding: '15px', textAlign: 'left', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length}
                    onChange={toggleAllRows}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                      cursor: column.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      color: '#999',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span style={{ color: '#e63946' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th style={{ padding: '15px', textAlign: 'center', color: '#999', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid #333',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '15px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} style={{ padding: '15px', color: '#fff' }}>
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {onView && (
                            <ShinyButton
                              onClick={() => onView(row)}
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#2980b9' }}
                            >
                              View
                            </ShinyButton>
                          )}
                          {onEdit && (
                            <ShinyButton
                              onClick={() => onEdit(row)}
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#f39c12' }}
                            >
                              Edit
                            </ShinyButton>
                          )}
                          {onDelete && (
                            <ShinyButton
                              onClick={() => onDelete(row)}
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#e63946' }}
                            >
                              Delete
                            </ShinyButton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div style={{ padding: '20px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ShinyButton
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', fontSize: '13px', background: '#333' }}
              >
                Previous
              </ShinyButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, filtered) => (
                  <>
                    {index > 0 && filtered[index - 1] !== page - 1 && (
                      <span style={{ padding: '8px', color: '#666' }}>...</span>
                    )}
                    <ShinyButton
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        background: currentPage === page ? '#e63946' : '#333',
                      }}
                    >
                      {page}
                    </ShinyButton>
                  </>
                ))}
              <ShinyButton
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', fontSize: '13px', background: '#333' }}
              >
                Next
              </ShinyButton>
            </div>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
