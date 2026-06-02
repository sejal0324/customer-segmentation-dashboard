import React, { useState, useMemo } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import SegmentCards from './components/SegmentCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import SqlViewer from './components/SqlViewer';
import CustomerTable from './components/CustomerTable';
import { rawCustomers, computeRfmSegmentation } from './data/rfmEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('All');

  // Compute RFM scores dynamically and cache results
  const segmentedCustomers = useMemo(() => {
    return computeRfmSegmentation(rawCustomers);
  }, []);

  const totalCustomersCount = segmentedCustomers.length;

  // Format date display
  const currentDateString = useMemo(() => {
    const date = new Date('2026-06-01T18:28:00+05:30');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Page title mapping based on active navigation tab
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'CUSTOMER SEGMENTATION DASHBOARD',
          subtitle: 'Real-time customer segment intelligence and value metrics'
        };
      case 'explorer':
        return {
          title: 'Customer Explorer Hub',
          subtitle: 'Interactive customer search, multi-column sorting, and cohort filters'
        };
      case 'sql':
        return {
          title: 'Data Pipeline Warehouse',
          subtitle: 'Visual SQL aggregation layers and transformation logic models'
        };
      case 'methodology':
        return {
          title: 'RFM Framework & Scoring Rules',
          subtitle: 'Mathematical quintile breakdowns and segment decision logic'
        };
      default:
        return {
          title: 'Decision Sciences Dashboard',
          subtitle: 'Enterprise customer segmentation'
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div className="app-container">
      {/* 1. Dark Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalCustomers={totalCustomersCount}
      />

      {/* 2. Main Content Frame */}
      <main className="main-content">
        {/* Sticky Dashboard Header */}
        <header className="dashboard-header">
          <div className="header-title-area">
            <h1>{header.title}</h1>
            <p>{header.subtitle}</p>
          </div>
          <div className="header-actions">
            <div className="date-badge" aria-label="Current reporting period">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{currentDateString}</span>
            </div>
          </div>
        </header>

        {/* 3. Dashboard Body View Switcher */}
        <div className="dashboard-body">
          
          {/* VIEW A: Executive Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              {/* Row 1: KPI Cards */}
              <SegmentCards 
                customers={segmentedCustomers}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />

              {/* Row 2: Custom SVG Interactive Charts */}
              <AnalyticsCharts 
                customers={segmentedCustomers}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />

              {/* Row 3: Visual SQL Query Panel */}
              <SqlViewer />

              {/* Row 4: Datatable Explorer */}
              <CustomerTable 
                customers={segmentedCustomers}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </>
          )}

          {/* VIEW B: Dedicated Customer Explorer */}
          {activeTab === 'explorer' && (
            <CustomerTable 
              customers={segmentedCustomers}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          )}

          {/* VIEW C: Dedicated SQL Pipeline Viewer */}
          {activeTab === 'sql' && (
            <SqlViewer />
          )}

          {/* VIEW D: Methodology Documentation Panel */}
          {activeTab === 'methodology' && (
            <>
              {/* Core Framework Cards */}
              <div className="methodology-grid">
                <div className="methodology-item">
                  <div className="methodology-item-header">
                    <div className="methodology-dot r">R</div>
                    <h4>Recency (Days)</h4>
                  </div>
                  <p>
                    Measures the elapsed time since the customer's last successful transaction. 
                    Lower values indicate active, top-of-mind brand engagement, while higher values signify dormant customer accounts requiring proactive win-back protocols.
                  </p>
                </div>

                <div className="methodology-item">
                  <div className="methodology-item-header">
                    <div className="methodology-dot f">F</div>
                    <h4>Frequency (Orders)</h4>
                  </div>
                  <p>
                    Quantifies the cumulative count of separate transaction occurrences completed by the customer. 
                    High frequency is a strong indicator of brand loyalty, product-market fit, and embedded habit loops.
                  </p>
                </div>

                <div className="methodology-item">
                  <div className="methodology-item-header">
                    <div className="methodology-dot m">M</div>
                    <h4>Monetary (Gross Value)</h4>
                  </div>
                  <p>
                    Tracks the cumulative gross transaction value (revenue) contributed by the customer. 
                    Enables the isolation of high-yield whale accounts from low-margin retail transaction flows.
                  </p>
                </div>
              </div>

              {/* Statistical Quintiles Breakdown */}
              <div className="scoring-guide-card">
                <div className="card-header">
                  <div className="card-title-container">
                    <h3>Statistical Quintile Scoring Model</h3>
                    <p>Understanding the mathematical scaling structure of RFM analytics</p>
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  In enterprise Decision Sciences, customers are sorted and partitioned into 5 equal percentiles (quintiles, each comprising exactly 20% of the active database) for each of the three metrics. 
                  This creates a standardized score from <strong>1 (Worst) to 5 (Best)</strong>, neutralizing outliers and scaling value uniformly.
                </p>

                <div className="scoring-grid" aria-label="RFM Scoring Level Breakdown">
                  <div className="scoring-level">
                    <div className="scoring-level-num">5</div>
                    <div className="scoring-level-label">Top 20%</div>
                    <div className="scoring-level-desc">Highest tier performance. Immediate activity, maximal order count, or premium spend rates.</div>
                  </div>
                  
                  <div className="scoring-level">
                    <div className="scoring-level-num">4</div>
                    <div className="scoring-level-label">20% - 40%</div>
                    <div className="scoring-level-desc">Above-average contributors with high potential to upgrade to tier 5 status.</div>
                  </div>

                  <div className="scoring-level">
                    <div className="scoring-level-num">3</div>
                    <div className="scoring-level-label">40% - 60%</div>
                    <div className="scoring-level-desc">Median customer segment representing the stable core baseline of consumer activity.</div>
                  </div>

                  <div className="scoring-level">
                    <div className="scoring-level-num">2</div>
                    <div className="scoring-level-label">60% - 80%</div>
                    <div className="scoring-level-desc">Below-average engagement. Dormant accounts or low transaction yields.</div>
                  </div>

                  <div className="scoring-level">
                    <div className="scoring-level-num">1</div>
                    <div className="scoring-level-label">Bottom 20%</div>
                    <div className="scoring-level-desc">Lowest tier performance. Complete dormancy, single-purchase history, or nominal spend values.</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
