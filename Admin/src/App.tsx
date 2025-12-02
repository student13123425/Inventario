import React, { useEffect, useState } from 'react';
import './style.css';
import DashboardView, { StatisticsSummary } from './DashboardView';
import SystemStatusView from './SystemStatusView';
import ReportsView from './ReportsView';

type ViewState = 'dashboard' | 'status' | 'reports';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatisticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/public/stats');
        const json = await response.json();
        
        if (json.success) {
           setData({
             timestamp: json.timestamp || new Date().toISOString(),
             total_users: json.total_users || 0,
             users_analytics: json.users_analytics || []
           });
        } else {
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
  
  const chartData = data?.users_analytics[0]?.sales_trends.map(t => ({
    label: t.period,
    value: data.users_analytics.reduce((acc, user) => {
      const trend = user.sales_trends.find(ut => ut.period === t.period);
      return acc + (trend ? trend.total_sales : 0);
    }, 0)
  })) || [];

  const navItemStyle = (view: ViewState) => ({
    padding: '12px',
    background: currentView === view ? 'var(--c-navy)' : 'transparent',
    color: currentView === view ? 'white' : 'var(--c-text-tertiary)',
    borderRadius: '6px',
    marginBottom: '8px',
    cursor: 'pointer',
    fontWeight: currentView === view ? 500 : 400,
    transition: 'all 0.2s ease'
  });

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
          <div style={navItemStyle('dashboard')} onClick={() => setCurrentView('dashboard')}>
            Dashboard
          </div>
          <div style={navItemStyle('status')} onClick={() => setCurrentView('status')}>
            System Status
          </div>
          <div style={navItemStyle('reports')} onClick={() => setCurrentView('reports')}>
            Reports
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: 600, color: 'var(--c-text-secondary)' }}>
            {currentView === 'dashboard' ? 'Public Statistics Overview' : 
             currentView === 'status' ? 'System Diagnostics' : 'Data Reporting'}
          </div>
          <div className="status-badge status-success">System Online</div>
        </header>

        {currentView === 'dashboard' && (
          <DashboardView 
            data={data}
            error={error}
            totalSystemInventory={totalSystemInventory}
            totalSystemDailySales={totalSystemDailySales}
            chartData={chartData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {currentView === 'status' && <SystemStatusView />}
        
        {currentView === 'reports' && <ReportsView />}

        <div style={{ textAlign: 'center', color: 'var(--c-text-tertiary)', fontSize: '0.875rem', marginTop: 'auto', marginBottom: '2rem', paddingTop: '2rem' }}>
          Inventrio Analytics Core v1.0.0 &bull; Secure Administrative Interface
        </div>
      </main>
    </div>
  );
};

export default App;