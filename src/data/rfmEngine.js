// Decision Sciences RFM Analytics - Data & Calculation Engine

// 1. Raw Customer Summary Data (20 Customers with realistic corporate telemetry)
export const rawCustomers = [
  { customerId: 'C-1001', recencyDays: 3,   frequency: 18, monetary: 2450.00 },
  { customerId: 'C-1002', recencyDays: 85,  frequency: 8,  monetary: 620.00  },
  { customerId: 'C-1003', recencyDays: 12,  frequency: 15, monetary: 1890.00 },
  { customerId: 'C-1004', recencyDays: 190, frequency: 2,  monetary: 110.00  },
  { customerId: 'C-1005', recencyDays: 6,   frequency: 1,  monetary: 95.00   },
  { customerId: 'C-1006', recencyDays: 310, frequency: 1,  monetary: 45.00   },
  { customerId: 'C-1007', recencyDays: 140, frequency: 12, monetary: 1520.00 },
  { customerId: 'C-1008', recencyDays: 25,  frequency: 4,  monetary: 340.00  },
  { customerId: 'C-1009', recencyDays: 2,   frequency: 20, monetary: 3100.00 },
  { customerId: 'C-1010', recencyDays: 45,  frequency: 10, monetary: 1120.00 },
  { customerId: 'C-1011', recencyDays: 150, frequency: 14, monetary: 1680.00 },
  { customerId: 'C-1012', recencyDays: 8,   frequency: 3,  monetary: 280.00  },
  { customerId: 'C-1013', recencyDays: 240, frequency: 2,  monetary: 90.00   },
  { customerId: 'C-1014', recencyDays: 5,   frequency: 16, monetary: 2100.00 },
  { customerId: 'C-1015', recencyDays: 65,  frequency: 6,  monetary: 750.00  },
  { customerId: 'C-1016', recencyDays: 18,  frequency: 2,  monetary: 150.00  },
  { customerId: 'C-1017', recencyDays: 380, frequency: 1,  monetary: 35.00   },
  { customerId: 'C-1018', recencyDays: 110, frequency: 9,  monetary: 980.00  },
  { customerId: 'C-1019', recencyDays: 4,   frequency: 2,  monetary: 190.00  },
  { customerId: 'C-1020', recencyDays: 55,  frequency: 7,  monetary: 820.00  }
];

// 2. Dynamic RFM Quintile & Segmentation Engine
// This computes actual 1-5 rankings based on statistical quintiles (similar to SQL NTILE)
export function computeRfmSegmentation(customers) {
  const size = customers.length;
  
  // Sort and assign Recency Scores (1-5: lower days are better, so they get HIGHER scores)
  const sortedByRecency = [...customers].sort((a, b) => a.recencyDays - b.recencyDays);
  const recencyRanks = {};
  sortedByRecency.forEach((c, idx) => {
    // Determine quintile: top 20% (indices 0..3) get 5, next 20% get 4, etc.
    const score = 5 - Math.floor(idx / (size / 5));
    recencyRanks[c.customerId] = Math.max(1, Math.min(5, score));
  });

  // Sort and assign Frequency Scores (1-5: higher frequency is better, gets HIGHER scores)
  const sortedByFreq = [...customers].sort((a, b) => b.frequency - a.frequency);
  const freqRanks = {};
  sortedByFreq.forEach((c, idx) => {
    const score = 5 - Math.floor(idx / (size / 5));
    freqRanks[c.customerId] = Math.max(1, Math.min(5, score));
  });

  // Sort and assign Monetary Scores (1-5: higher spend is better, gets HIGHER scores)
  const sortedByMonetary = [...customers].sort((a, b) => b.monetary - a.monetary);
  const monetaryRanks = {};
  sortedByMonetary.forEach((c, idx) => {
    const score = 5 - Math.floor(idx / (size / 5));
    monetaryRanks[c.customerId] = Math.max(1, Math.min(5, score));
  });

  // Segment Map & Final Construction
  return customers.map(c => {
    const r = recencyRanks[c.customerId];
    const f = freqRanks[c.customerId];
    const m = monetaryRanks[c.customerId];
    const rfmScore = `${r}${f}${m}`;
    
    // Segment Assignment Logic (Decision Sciences Criteria)
    let segmentLabel = '';
    
    if (r >= 4 && f >= 4 && m >= 4) {
      segmentLabel = 'Champion';
    } else if (r <= 2 && f >= 3 && m >= 3) {
      segmentLabel = 'At Risk';
    } else if (r <= 2 && f <= 2 && m <= 2) {
      segmentLabel = 'Lost Customer';
    } else if (r >= 4 && f <= 2) {
      segmentLabel = 'New Customer';
    } else {
      segmentLabel = 'Loyal Customer';
    }

    return {
      ...c,
      rScore: r,
      fScore: f,
      mScore: m,
      rfmScore,
      segmentLabel
    };
  });
}

// 3. Segment Meta Definition (for colors, icons, descriptions)
export const segmentDetails = {
  'Champion': {
    name: 'Champion',
    color: 'var(--color-champion)',
    bg: 'var(--color-champion-bg)',
    desc: 'Best customers who buy frequently, spend highly, and purchased very recently.',
    action: 'Reward with exclusive VIP programs, early product previews, and high-touch updates.'
  },
  'Loyal Customer': {
    name: 'Loyal Customer',
    color: 'var(--color-loyal)',
    bg: 'var(--color-loyal-bg)',
    desc: 'Consistent buyers with healthy transaction value. Responsive to marketing.',
    action: 'Upsell premium tiers, cross-sell related categories, and introduce loyalty point boosts.'
  },
  'New Customer': {
    name: 'New Customer',
    color: 'var(--color-new)',
    bg: 'var(--color-new-bg)',
    desc: 'First-time buyers who made recent purchases. Low frequency, low-to-mid spend.',
    action: 'Trigger welcome sequences, onboarding support, and a first-purchase follow-up discount.'
  },
  'At Risk': {
    name: 'At Risk',
    color: 'var(--color-atrisk)',
    bg: 'var(--color-atrisk-bg)',
    desc: 'Big spenders who buy frequently but haven\'t purchased in a critical timeframe.',
    action: 'Trigger high-value win-back offers, direct customer success outreach, or survey incentives.'
  },
  'Lost Customer': {
    name: 'Lost Customer',
    color: 'var(--color-lost)',
    bg: 'var(--color-lost-bg)',
    desc: 'Lapsed, low-value customers with very poor recency, frequency, and spend.',
    action: 'Attempt low-cost automated email reactivation campaigns or move to secondary marketing tracks.'
  }
};

// 4. visual SQL Pipeline Scripts
export const sqlQueries = [
  {
    step: 1,
    title: '1. RFM Aggregation',
    description: 'Aggregates raw ERP/E-commerce transaction records to summarize Recency (days elapsed since last order), Frequency (total orders), and Monetary Value (total spent) for each customer.',
    query: `-- Step 1: Aggregate Raw Transactional Telemetry
WITH raw_rfm AS (
  SELECT
    customer_id,
    -- Calculate days since last order relative to the pipeline run date
    DATEDIFF(day, MAX(order_date), CURRENT_DATE()) AS recency_days,
    -- Frequency of transaction occurrences
    COUNT(DISTINCT order_id) AS frequency,
    -- Total Gross Revenue contributed
    SUM(gross_revenue_usd) AS monetary
  FROM enterprise_dw.commerce.orders
  WHERE order_status = 'COMPLETED'
  GROUP BY customer_id
)
SELECT * FROM raw_rfm;`
  },
  {
    step: 2,
    title: '2. NTILE(5) Quintiles',
    description: 'Partitions the aggregated customer database into equal quintiles (5 groups of 20% each) to score Recency, Frequency, and Monetary metrics from 1 to 5.',
    query: `-- Step 2: Calculate Statistical Quintile Scores (1 to 5)
-- NTILE(5) generates statistical percentiles. 
-- Note: Lower recency_days gets a score of 5 (Highest Rank)
WITH quintiles AS (
  SELECT
    customer_id,
    recency_days,
    frequency,
    monetary,
    NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score,
    NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
    NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
  FROM raw_rfm
)
SELECT 
  *,
  -- Combine individual scores into an RFM signature code (e.g. '555')
  CONCAT(r_score, f_score, m_score) AS rfm_signature
FROM quintiles;`
  },
  {
    step: 3,
    title: '3. Decision Classifications',
    description: 'Implements a standard Decision Science logic matrix using SQL CASE statements to label each customer based on their combined RFM signature scores.',
    query: `-- Step 3: Segment and Label Customers using Decision Rules
WITH segmented_base AS (
  SELECT
    customer_id,
    recency_days,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    rfm_signature
  FROM quintiles
)
SELECT
  *,
  CASE
    -- Champions: Highly Active, High Freq, High Spend
    WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champion'
    
    -- At Risk: Sleepers with high historical value who need attention
    WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN 'At Risk'
    
    -- Lost: Deep sleepers with low historical value
    WHEN r_score <= 2 AND f_score <= 2 AND m_score <= 2 THEN 'Lost Customer'
    
    -- New Customers: Recent acquisitions with low engagement histories
    WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customer'
    
    -- Loyal: Solid regular contributors that do not fit Champion criteria
    ELSE 'Loyal Customer'
  END AS segment_label
FROM segmented_base
ORDER BY monetary DESC;`
  }
];
