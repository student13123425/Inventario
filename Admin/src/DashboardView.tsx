import React from 'react';

// --- Shared Types (Exported for App.tsx) ---

export interface SalesTrendData {
  period: string;
  total_sales: number;
}

export interface OverallAnalytics {
  user_id: number;
  shop_name: string;
  collection_date: string;
  total_inventory_value: number;
  today_sales: number;
  sales_trends: SalesTrendData[];
}

export interface StatisticsSummary {
  timestamp: string;
  total_users: number;
  users_analytics: OverallAnalytics[];
}

// --- Shared Components (Exported for SystemStatus) ---

export const MetricCard = ({ title, value, subtext, trend }: { title: string, value: string, subtext?: string, trend?: 'up' | 'down' | 'neutral' }) => (
  <div className="admin-card metric-card">
    <div className="card-header">{title}</div>
    <div className="metric-value">{value}</div>
    {subtext && (
      <div className="metric-sub">
        {trend === 'up' && <span style={{color: 'var(--c-success)'}}>↑</span>}
        {trend === 'down' && <span style={{color: 'var(--c-alert)'}}>↓</span>}
        {subtext}
      </div>
    )}
  </div>
);

// --- Local Components ---

const SimpleTrendChart = ({ data }: { data: { label: string, value: number }[] }) => {
  if (!data || data.length === 0) return <div className="admin-card" style={{gridColumn: 'span 12', height: '200px', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--c-text-tertiary)'}}>No Trend Data Available</div>;

  const height = 250;
  const width = 1000;
  const padding = 20;
  
  const maxValue = Math.max(...data.map(d => d.value)) || 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
    return `${x},${y}`;
  }).join(' ');

  const fillArea = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <div className="admin-card" style={{ gridColumn: 'span 12' }}>
      <div className="card-header" style={{ color: 'var(--c-purple)' }}>Aggregate Revenue Trend (30 Days)</div>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', maxHeight: '300px' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--c-purple)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--c-purple)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--c-border)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--c-border)" strokeDasharray="4" strokeWidth="1" />
          <polygon points={fillArea} fill="url(#chartGradient)" />
          <polyline points={points} fill="none" stroke="var(--c-purple)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => {
             const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
             const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
             return (
               <g key={i}>
                 <circle cx={x} cy={y} r="4" fill="white" stroke="var(--c-purple)" strokeWidth="2" />
               </g>
             );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--c-text-tertiary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

const ShopTable = ({ shops }: { shops: OverallAnalytics[] }) => (
  <div className="data-table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>Shop Name</th>
          <th>Collection Date</th>
          <th style={{textAlign: 'right'}}>Daily Sales</th>
          <th style={{textAlign: 'right'}}>Inventory Value</th>
          <th style={{textAlign: 'center'}}>Status</th>
        </tr>
      </thead>
      <tbody>
        {shops.map((shop) => (
          <tr key={shop.user_id}>
            <td style={{fontWeight: 500}}>{shop.shop_name}</td>
            <td className="mono-text" style={{fontSize: '0.8rem'}}>{new Date(shop.collection_date).toLocaleDateString()}</td>
            <td className="cell-numeric">${shop.today_sales.toLocaleString()}</td>
            <td className="cell-numeric">${shop.total_inventory_value.toLocaleString()}</td>
            <td style={{textAlign: 'center'}}>
              <span className="status-badge status-success">Active</span>
            </td>
          </tr>
        ))}
        {shops.length === 0 && (
          <tr>
            <td colSpan={5} style={{textAlign: 'center', padding: '2rem', color: 'var(--c-text-tertiary)'}}>
              No active shop data available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Main Component ---

interface DashboardProps {
  data: StatisticsSummary | null;
  error: string | null;
  totalSystemInventory: number;
  totalSystemDailySales: number;
  chartData: { label: string, value: number }[];
  formatCurrency: (val: number) => string;
  formatDate: (iso: string) => string;
}

const DashboardView: React.FC<DashboardProps> = ({ 
  data, 
  error, 
  totalSystemInventory, 
  totalSystemDailySales, 
  chartData, 
  formatCurrency, 
  formatDate 
}) => {
  return (
    <div className="page-content">
      <div className="section-header">
        <h1>Executive Dashboard</h1>
      </div>
      <div className="subtitle">
        System-wide aggregation. Last collection: <span className="mono-text">{formatDate(data?.timestamp || new Date().toISOString())}</span>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fca5a5' }}>
          <strong>Alert:</strong> {error}
        </div>
      )}

      <div className="dashboard-grid">
        <MetricCard 
          title="Total Active Shops" 
          value={data?.total_users.toString() || "0"} 
          subtext="Registered tenancies"
          trend="neutral"
        />
        <MetricCard 
          title="System-Wide Inventory" 
          value={formatCurrency(totalSystemInventory)} 
          subtext="Total valuation"
          trend="up"
        />
        <MetricCard 
          title="Daily Transaction Vol" 
          value={formatCurrency(totalSystemDailySales)} 
          subtext="Aggregated sales (24h)"
          trend={totalSystemDailySales > 0 ? "up" : "neutral"}
        />
        <MetricCard 
          title="Pending Processing" 
          value="0" 
          subtext="Queue empty"
          trend="neutral"
        />

        <SimpleTrendChart data={chartData} />

        <div className="section-header" style={{ gridColumn: 'span 12', marginTop: 'var(--space-xl)' }}>
          Tenancy Performance Data
        </div>
        <ShopTable shops={data?.users_analytics || []} />
      </div>
    </div>
  );
};

export default DashboardView;