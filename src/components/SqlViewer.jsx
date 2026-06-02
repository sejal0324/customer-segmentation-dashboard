import React, { useState } from 'react';
import { sqlQueries } from '../data/rfmEngine';

export default function SqlViewer() {
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const activeQueryObj = sqlQueries.find(q => q.step === activeStep);

  // Custom regex-based SQL syntax highlighting function
  const highlightSql = (sqlText) => {
    if (!sqlText) return '';
    
    // 1. Temporarily isolate comments
    const comments = [];
    let highlighted = sqlText.replace(/(--.*)/g, (match) => {
      comments.push(match);
      return `__SQL_COMMENT_${comments.length - 1}__`;
    });

    // SQL Keywords
    const keywords = [
      'WITH', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
      'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'CASE', 'WHEN', 'THEN', 
      'ELSE', 'END', 'OVER', 'PARTITION BY', 'NTILE', 'CONCAT', 'DESC', 'ASC'
    ];
    
    // SQL Functions
    const functions = [
      'DATEDIFF', 'MAX', 'MIN', 'CURRENT_DATE', 'COUNT', 'SUM', 'AVG', 'DISTINCT'
    ];

    // Highlight strings first (e.g. 'Champion', 'Lost Customer')
    highlighted = highlighted.replace(/('[^']*')/g, '<span class="sql-string">$1</span>');

    // Highlight keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
    });

    // Highlight functions
    functions.forEach(fn => {
      const regex = new RegExp(`\\b(${fn})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="sql-function">$1</span>');
    });

    // Highlight numerical values (avoid matching hex or numbers inside tag strings)
    highlighted = highlighted.replace(/\b(\d+)\b(?![^<]*>)/g, '<span class="sql-number">$1</span>');

    // 2. Put comments back with styling
    comments.forEach((comment, idx) => {
      highlighted = highlighted.replace(`__SQL_COMMENT_${idx}__`, `<span class="sql-comment">${comment}</span>`);
    });

    return highlighted;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeQueryObj.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sql-hub-card">
      <div className="card-header">
        <div className="card-title-container">
          <h3>SQL Pipeline Visualizer</h3>
          <p>Inspect the data warehouse queries that calculate individual RFM scores and segments</p>
        </div>
      </div>

      {/* Steps Navigation Tabs */}
      <div className="sql-tabs" role="tablist" aria-label="SQL Pipeline Steps">
        {sqlQueries.map(q => (
          <button
            key={q.step}
            role="tab"
            aria-selected={activeStep === q.step}
            className={`sql-tab ${activeStep === q.step ? 'active' : ''}`}
            onClick={() => {
              setActiveStep(q.step);
              setCopied(false);
            }}
          >
            {q.title.split('. ')[1]}
          </button>
        ))}
      </div>

      {/* Pipeline Explanation description */}
      <div className="sql-query-desc">
        <strong>Pipeline Context:</strong> {activeQueryObj.description}
      </div>

      {/* Code Editor Panel */}
      <div style={{ marginTop: '20px' }}>
        <div className="sql-code-container">
          {/* Copy Button */}
          <button 
            className="sql-copy-btn" 
            onClick={handleCopy}
            aria-label="Copy SQL query to clipboard"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Query</span>
              </>
            )}
          </button>

          {/* Highlighted Code */}
          <pre className="sql-code-pre">
            <code dangerouslySetInnerHTML={{ __html: highlightSql(activeQueryObj.query) }} />
          </pre>
        </div>
      </div>
    </div>
  );
}
