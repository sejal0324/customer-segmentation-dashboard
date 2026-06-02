import React, { useState, useMemo } from 'react';
import { segmentDetails } from '../data/rfmEngine';

export default function CustomerTable({ customers, activeFilter, setActiveFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('monetary'); // Default sort by highest spender
  const [sortDirection, setSortDirection] = useState('desc');

  // Available segments for select list
  const segmentList = ['All', 'Champion', 'Loyal Customer', 'New Customer', 'At Risk', 'Lost Customer'];

  // Sorting caret SVGs
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-blue)' }}>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ) : (
      <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-blue)' }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  // 1. Apply Search and Dropdown Filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Segment Dropdown Filter
      const matchesSegment = activeFilter === 'All' || c.segmentLabel === activeFilter;
      
      // Text Search Bar Filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        c.customerId.toLowerCase().includes(searchLower) ||
        c.recencyDays.toString().includes(searchLower) ||
        c.frequency.toString().includes(searchLower) ||
        c.monetary.toFixed(0).includes(searchLower) ||
        c.rfmScore.includes(searchLower) ||
        c.segmentLabel.toLowerCase().includes(searchLower);

      return matchesSegment && matchesSearch;
    });
  }, [customers, activeFilter, searchQuery]);

  // 2. Apply Column Sorting
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle custom string and number conversions
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Mathematical numeric sorting
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredCustomers, sortField, sortDirection]);

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title-container">
          <h3>Customer Segments Explorer</h3>
          <p>Review metrics of individual customers, rank by RFM values, and filter results</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="table-controls">
        {/* Search Bar */}
        <div className="table-search-box">
          <svg className="table-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="table-search-input"
            placeholder="Search customer ID, spent, score..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search customer database"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="table-filter-group">
          <span className="filter-label">Filter Segment:</span>
          <select
            className="segment-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            aria-label="Select segment to filter"
          >
            {segmentList.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'All' ? 'All Segments' : opt}
              </option>
            ))}
          </select>

          {/* Quick Active Filter Pill */}
          {activeFilter !== 'All' && (
            <div className="active-filter-indicator">
              <span>Segment: {activeFilter}</span>
              <button 
                className="clear-filter-btn" 
                onClick={() => setActiveFilter('All')}
                title="Clear segment filter"
                aria-label="Clear segment filter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Datatable Area */}
      <div className="table-wrapper">
        <table className="customer-table" aria-label="Customer RFM segments list">
          <thead>
            <tr>
              <th onClick={() => handleSort('customerId')} role="columnheader" aria-sort={sortField === 'customerId' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>Customer ID</span> {getSortIcon('customerId')}
                </div>
              </th>
              <th onClick={() => handleSort('recencyDays')} role="columnheader" aria-sort={sortField === 'recencyDays' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>Recency (Days)</span> {getSortIcon('recencyDays')}
                </div>
              </th>
              <th onClick={() => handleSort('frequency')} role="columnheader" aria-sort={sortField === 'frequency' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>Frequency (Orders)</span> {getSortIcon('frequency')}
                </div>
              </th>
              <th onClick={() => handleSort('monetary')} role="columnheader" aria-sort={sortField === 'monetary' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>Monetary (Spend)</span> {getSortIcon('monetary')}
                </div>
              </th>
              <th onClick={() => handleSort('rfmScore')} role="columnheader" aria-sort={sortField === 'rfmScore' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>RFM Score</span> {getSortIcon('rfmScore')}
                </div>
              </th>
              <th onClick={() => handleSort('segmentLabel')} role="columnheader" aria-sort={sortField === 'segmentLabel' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="customer-table th-content">
                  <span>Segment Label</span> {getSortIcon('segmentLabel')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map((c) => {
                // Determine class badge
                const badgeClass = c.segmentLabel.toLowerCase().replace(' ', '-');
                
                return (
                  <tr key={c.customerId}>
                    <td className="cell-customer-id">{c.customerId}</td>
                    <td>{c.recencyDays}d</td>
                    <td>{c.frequency} orders</td>
                    <td>${c.monetary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className="cell-rfm-score">{c.rfmScore}</span>
                    </td>
                    <td>
                      <span className={`segment-badge ${badgeClass}`}>
                        {c.segmentLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="table-empty-state">
                    <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    <h4>No Customers Found</h4>
                    <p>No records match your active search terms or segment filter combinations.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
