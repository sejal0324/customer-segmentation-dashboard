import React, { useState } from 'react';
import { segmentDetails } from '../data/rfmEngine';

export default function AnalyticsCharts({ customers, activeFilter, setActiveFilter }) {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const segments = ['Champion', 'Loyal Customer', 'New Customer', 'At Risk', 'Lost Customer'];
  const totalCustomers = customers.length;

  // 1. Calculate stats per segment
  const stats = segments.map(segName => {
    const segCustomers = customers.filter(c => c.segmentLabel === segName);
    const count = segCustomers.length;
    const revenue = segCustomers.reduce((acc, c) => acc + c.monetary, 0);
    return {
      name: segName,
      count,
      revenue,
      color: segmentDetails[segName].color,
      bg: segmentDetails[segName].bg
    };
  });

  const totalRevenue = stats.reduce((acc, s) => acc + s.revenue, 0);

  // 2. Bar Chart Calculations
  const chartHeight = 220;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const maxCount = Math.max(...stats.map(s => s.count), 5); // Fallback to 5 to avoid div-by-zero or empty space
  const yTicks = [0, Math.ceil(maxCount / 4), Math.ceil(maxCount / 2), Math.ceil((3 * maxCount) / 4), maxCount];

  // Bar Chart Interaction Handler
  const handleBarMouseMove = (e, stat, idx) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.parentElement.parentElement.getBoundingClientRect();
    
    // Position relative to chart container
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top;

    setHoveredBar(idx);
    setTooltip({
      show: true,
      x,
      y,
      content: (
        <>
          <div className="tooltip-title" style={{ color: stat.color }}>{stat.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Customers:</span>
            <span className="tooltip-value">{stat.count}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Share:</span>
            <span className="tooltip-value">{((stat.count / totalCustomers) * 100).toFixed(0)}%</span>
          </div>
        </>
      )
    });
  };

  const handleBarMouseLeave = () => {
    setHoveredBar(null);
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // 3. Donut Chart Calculations (Math for Arc Paths)
  const donutCenterX = 130;
  const donutCenterY = 130;
  const donutRadius = 90;
  const innerRadius = 55;

  let cumulativeAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const donutSlices = stats.map((stat, idx) => {
    const share = totalRevenue > 0 ? stat.revenue / totalRevenue : 0;
    const angleRange = share * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angleRange;
    cumulativeAngle = endAngle;

    // Calculate arc coordinate values
    const getPoint = (angle, radius) => [
      donutCenterX + radius * Math.cos(angle),
      donutCenterY + radius * Math.sin(angle)
    ];

    const [outerStartX, outerStartY] = getPoint(startAngle, donutRadius);
    const [outerEndX, outerEndY] = getPoint(endAngle, donutRadius);
    const [innerStartX, innerStartY] = getPoint(startAngle, innerRadius);
    const [innerEndX, innerEndY] = getPoint(endAngle, innerRadius);

    const largeArcFlag = angleRange > Math.PI ? 1 : 0;

    // Draw the segment donut path using SVG arc commands
    const d = share === 1 
      ? `M ${donutCenterX} ${donutCenterY - donutRadius} 
         A ${donutRadius} ${donutRadius} 0 1 1 ${donutCenterX - 0.01} ${donutCenterY - donutRadius} 
         M ${donutCenterX} ${donutCenterY - innerRadius} 
         A ${innerRadius} ${innerRadius} 0 1 0 ${donutCenterX + 0.01} ${donutCenterY - innerRadius}`
      : share === 0 
        ? ''
        : `M ${outerStartX} ${outerStartY} 
           A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY} 
           L ${innerEndX} ${innerEndY} 
           A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`;

    return {
      ...stat,
      share,
      d,
      index: idx
    };
  });

  // Donut Interaction Handler
  const handleDonutMouseMove = (e, slice) => {
    const containerRect = e.currentTarget.parentElement.getBoundingClientRect();
    const svgRect = e.currentTarget.getBoundingClientRect();
    
    // Position near the mouse pointer
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    setHoveredSlice(slice.index);
    setTooltip({
      show: true,
      x,
      y,
      content: (
        <>
          <div className="tooltip-title" style={{ color: slice.color }}>{slice.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Revenue:</span>
            <span className="tooltip-value">${slice.revenue.toLocaleString()}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Contribution:</span>
            <span className="tooltip-value">{(slice.share * 100).toFixed(1)}%</span>
          </div>
        </>
      )
    });
  };

  const handleDonutMouseLeave = () => {
    setHoveredSlice(null);
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <section className="charts-row" aria-label="Visual Analytics Dashboard Section">
      {/* 1. Bar Chart - Customers per Segment */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title-container">
            <h3>Customer Distribution</h3>
            <p>Number of active accounts grouped by RFM classification</p>
          </div>
        </div>

        <div className="svg-chart-container">
          <svg className="svg-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid Lines */}
            {yTicks.map((tick, idx) => {
              const yVal = paddingTop + plotHeight - (tick / maxCount) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={paddingLeft + plotWidth}
                    y2={yVal}
                    className="chart-grid-line"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={yVal + 4}
                    textAnchor="end"
                    className="chart-axis-text"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* X Axis Line */}
            <line
              x1={paddingLeft}
              y1={paddingTop + plotHeight}
              x2={paddingLeft + plotWidth}
              y2={paddingTop + plotHeight}
              className="chart-axis-line"
            />

            {/* Bars */}
            {stats.map((stat, idx) => {
              const barWidth = 45;
              const gap = (plotWidth - barWidth * stats.length) / (stats.length + 1);
              const xVal = paddingLeft + gap + idx * (barWidth + gap);
              const barHeight = stat.count > 0 ? (stat.count / maxCount) * plotHeight : 0;
              const yVal = paddingTop + plotHeight - barHeight;
              const isFiltered = activeFilter === stat.name;
              const isDimmed = activeFilter !== 'All' && !isFiltered;

              return (
                <g key={stat.name}>
                  {/* Background Pillar Shadow */}
                  <rect
                    x={xVal}
                    y={paddingTop}
                    width={barWidth}
                    height={plotHeight}
                    className="chart-bar-bg"
                    opacity={hoveredBar === idx ? 0.4 : 0}
                    style={{ transition: 'opacity var(--transition-fast)' }}
                  />

                  {/* Dynamic Filled Bar */}
                  <rect
                    x={xVal}
                    y={yVal}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={stat.color}
                    className="chart-bar"
                    opacity={isDimmed ? 0.35 : 0.9}
                    stroke={isFiltered ? 'var(--text-main)' : 'none'}
                    strokeWidth={2}
                    onClick={() => setActiveFilter(isFiltered ? 'All' : stat.name)}
                    onMouseMove={(e) => handleBarMouseMove(e, stat, idx)}
                    onMouseLeave={handleBarMouseLeave}
                  />

                  {/* X Axis Label */}
                  <text
                    x={xVal + barWidth / 2}
                    y={paddingTop + plotHeight + 18}
                    textAnchor="middle"
                    className="chart-axis-text"
                    style={{ 
                      fontWeight: isFiltered ? '700' : '500', 
                      fill: isFiltered ? 'var(--primary-blue)' : 'var(--text-muted)' 
                    }}
                  >
                    {stat.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {tooltip.show && (
            <div
              className="chart-tooltip"
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>

      {/* 2. Donut Pie Chart - Revenue Contribution */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title-container">
            <h3>Revenue Contribution</h3>
            <p>Gross monetary share generated per user segment</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              {donutSlices.map((slice) => {
                const isFiltered = activeFilter === slice.name;
                const isDimmed = activeFilter !== 'All' && !isFiltered;
                const isHovered = hoveredSlice === slice.index;

                return (
                  <path
                    key={slice.name}
                    d={slice.d}
                    fill={slice.color}
                    className="chart-pie-slice"
                    opacity={isDimmed ? 0.35 : isHovered ? 1 : 0.85}
                    stroke="var(--bg-card)"
                    strokeWidth={isFiltered ? 3 : 1.5}
                    style={{
                      transform: isHovered || isFiltered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${donutCenterX}px ${donutCenterY}px`,
                      transition: 'transform var(--transition-normal), opacity var(--transition-fast)'
                    }}
                    onClick={() => setActiveFilter(isFiltered ? 'All' : slice.name)}
                    onMouseMove={(e) => handleDonutMouseMove(e, slice)}
                    onMouseLeave={handleDonutMouseLeave}
                  />
                );
              })}

              {/* Inner Donut Center Hole */}
              <circle
                cx={donutCenterX}
                cy={donutCenterY}
                r={innerRadius}
                className="donut-center-circle"
              />

              {/* Center Metrics Readout */}
              <text
                x={donutCenterX}
                y={donutCenterY - 10}
                className="donut-center-label"
              >
                Total Value
              </text>
              <text
                x={donutCenterX}
                y={donutCenterY + 14}
                className="donut-center-value"
              >
                ${(totalRevenue / 1000).toFixed(1)}k
              </text>
            </svg>
          </div>

          {/* Elegant Horizontal/Vertical Legend */}
          <div className="pie-legend-list">
            {stats.map((stat) => {
              const share = totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0;
              const isFiltered = activeFilter === stat.name;
              
              return (
                <div
                  key={stat.name}
                  className="pie-legend-item"
                  onClick={() => setActiveFilter(isFiltered ? 'All' : stat.name)}
                >
                  <div className="pie-legend-left">
                    <div
                      className="pie-legend-dot"
                      style={{ 
                        backgroundColor: stat.color,
                        boxShadow: isFiltered ? `0 0 8px ${stat.color}` : 'none'
                      }}
                    ></div>
                    <span 
                      className="pie-legend-name"
                      style={{ fontWeight: isFiltered ? '700' : '500' }}
                    >
                      {stat.name}
                    </span>
                  </div>
                  <div className="pie-legend-values">
                    <span className="pie-legend-spend">${stat.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="pie-legend-pct">{share.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
