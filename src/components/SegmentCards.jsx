import React from 'react';
import { segmentDetails } from '../data/rfmEngine';

export default function SegmentCards({ customers, activeFilter, setActiveFilter }) {
  const segments = ['Champion', 'Loyal Customer', 'New Customer', 'At Risk', 'Lost Customer'];

  // Segment icons mapping
  const segmentIcons = {
    'Champion': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
        <path d="M12 2a7.7 7.7 0 0 1 7.54 8H4.46A7.7 7.7 0 0 1 12 2z" />
      </svg>
    ),
    'Loyal Customer': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    'New Customer': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    'At Risk': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    'Lost Customer': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="17" y1="8" x2="23" y2="14" />
        <line x1="23" y1="8" x2="17" y2="14" />
      </svg>
    )
  };

  const totalCount = customers.length;

  return (
    <section className="metrics-row" aria-label="Customer segments summary">
      {segments.map(segName => {
        const segDetails = segmentDetails[segName];
        const segCustomers = customers.filter(c => c.segmentLabel === segName);
        const count = segCustomers.length;
        const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;
        
        const avgSpend = count > 0 
          ? (segCustomers.reduce((acc, c) => acc + c.monetary, 0) / count).toFixed(2)
          : '0.00';

        const isActive = activeFilter === segName;

        const cardStyle = {
          '--segment-color': segDetails.color,
          '--segment-bg': segDetails.bg
        };

        const handleCardClick = () => {
          if (isActive) {
            setActiveFilter('All'); // Toggle filter off if already active
          } else {
            setActiveFilter(segName); // Filter to this segment
          }
        };

        return (
          <div
            key={segName}
            className={`metric-card ${isActive ? 'active-filter' : ''}`}
            style={cardStyle}
            onClick={handleCardClick}
            role="button"
            tabIndex="0"
            aria-pressed={isActive}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
              }
            }}
          >
            <div className="metric-card-header">
              <span className="metric-label">{segDetails.name}</span>
              <div className="metric-icon-wrapper">
                {segmentIcons[segName]}
              </div>
            </div>
            
            <div className="metric-value-container">
              <span className="metric-value">{count}</span>
              <span className="metric-percent">{percentage}%</span>
            </div>

            <div className="metric-footer">
              <span className="metric-spend-label">Avg. Spend</span>
              <span className="metric-spend-value">${parseFloat(avgSpend).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
