import React, { useEffect, useState } from 'react';
import './style.css';

// --- Types (Mirrored from objects.ts for standalone component) ---

interface SalesTrendData {
  period: string;
  total_sales: number;
}

interface OverallAnalytics {
  user_id: number;
  shop_name: string;
  collection_date: string;
  total_inventory_value: number;
  today_sales: number;
  sales_trends: SalesTrendData[];
}

interface StatisticsSummary {
  timestamp: string;
  total_users: number;
  users_analytics: OverallAnalytics[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Components ---

const MetricCard = ({ title, value, subtext, trend }: { title: string, value: string, subtext?: string, trend?: 'up' | 'down' | 'neutral' }) => (
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

// Custom SVG Chart to adhere to "Data Purple" and "Admin Teal" palette without external deps
const SimpleTrendChart = ({ data }: { data: { label: string, value: number }[] }) => {
  if (!data || data.length === 0) return <div className="admin-card" style={{gridColumn: 'span 12', height: '200px'}}>No Data</div>;

  const height = 250;
  const width = 1000; // viewBox width
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
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--c-purple)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--c-purple)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid Lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--c-border)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--c-border)" strokeDasharray="4" strokeWidth="1" />

          {/* Area Fill */}
          <polygon points={fillArea} fill="url(#chartGradient)" />

          {/* Line Path */}
          <polyline 
            points={points} 
            fill="none" 
            stroke="var(--c-purple)" 
            strokeWidth="3" 
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points */}
          {data.map((d, i) => {
             const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
             const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
             return (
               <g key={i} className="chart-point">
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

// --- Main Application ---

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatisticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    // In a real scenario, this would import publicStatsClient from './network'
    // For this demonstration, we fetch from the endpoint defined in the context
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/public/stats');
        const json = await response.json();
        
        if (json.success) {
           // Direct mapping as per the rewritten network.ts logic
           // The API returns the fields directly in the object if mapped correctly
           // Adapting based on standard response shape
           setData({
             timestamp: json.timestamp || new Date().toISOString(),
             total_users: json.total_users || 0,
             users_analytics: json.users_analytics || []
           });
        } else {
          // If file not found/generating, allow empty state
           setData({ timestamp: new Date().toISOString(), total_users: 0, users_analytics: [] });
        }
      } catch (err) {
        setError("Unable to connect to analytics server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aggregation Logic
  const totalSystemInventory = data?.users_analytics.reduce((acc, curr) => acc + curr.total_inventory_value, 0) || 0;
  const totalSystemDailySales = data?.users_analytics.reduce((acc, curr) => acc + curr.today_sales, 0) || 0;
  
  // Prepare Chart Data (Aggregating sales trends from all users)
  // Simplified aggregation for visual demo
  const chartData = data?.users_analytics[0]?.sales_trends.map(t => ({
    label: t.period,
    value: data.users_analytics.reduce((acc, user) => {
      const trend = user.sales_trends.find(ut => ut.period === t.period);
      return acc + (trend ? trend.total_sales : 0);
    }, 0)
  })) || [];

  if (loading) {
    return (
      <div className="admin-layout" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: 'var(--c-navy)', fontWeight: 600, fontFamily: 'var(--font-mono)'}}>
          INITIALIZING ANALYTICS SUBSYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          INVENTRIO <span className="brand-accent">ANALYTICS</span>
        </div>
        <nav style={{ padding: '24px 12px' }}>
          {/* Mock Navigation Items */}
          <div style={{ padding: '12px', background: 'var(--c-navy)', color: 'white', borderRadius: '6px', marginBottom: '8px', cursor: 'pointer', fontWeight: 500 }}>
            Dashboard
          </div>
          <div style={{ padding: '12px', color: 'var(--c-text-tertiary)', cursor: 'pointer' }}>
            System Status
          </div>
          <div style={{ padding: '12px', color: 'var(--c-text-tertiary)', cursor: 'pointer' }}>
            Reports
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: 600, color: 'var(--c-text-secondary)' }}>Public Statistics Overview</div>
          <div className="status-badge status-success">System Online</div>
        </header>

        <div className="page-content">
          <div className="section-header">
            <h1>Executive Dashboard</h1>
          </div>
          <div className="subtitle">
            System-wide aggregation. Last collection: <span className="mono-text">{formatDate(data?.timestamp || '')}</span>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fca5a5' }}>
              <strong>Alert:</strong> {error}
            </div>
          )}

          {/* Metric Grid */}
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

            {/* Chart */}
            <SimpleTrendChart data={chartData} />

            {/* Data Table */}
            <div className="section-header" style={{ gridColumn: 'span 12', marginTop: 'var(--space-xl)' }}>
              Tenancy Performance Data
            </div>
            <ShopTable shops={data?.users_analytics || []} />
          </div>

          <div style={{ textAlign: 'center', color: 'var(--c-text-tertiary)', fontSize: '0.875rem', marginTop: '4rem' }}>
            Inventrio Analytics Core v1.0.0 &bull; Secure Administrative Interface
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;