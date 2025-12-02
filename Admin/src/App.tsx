import React, { useEffect, useState } from 'react';
import './style.css';
import SystemStatusView from './SystemStatusView';
import ReportsView from './ReportsView';
import LoginView from './LoginView';
import ChangeCredentialsView from './ChangeCredentialsView';
import { AdminStorage } from './script/storage';
import type { StatisticsSummary } from './script/objects';
import { adminClient } from './script/network';
import DashboardView from './DashboardView';

type ViewState = 'dashboard' | 'status' | 'reports' | 'settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StatisticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = AdminStorage.isAuthenticated();
      setIsAuthenticated(hasToken);
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  // Formatting helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  // Fetch Data - Only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Using public endpoint as per original, but now behind auth gate in UI
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
  }, [isAuthenticated]);

  const handleLogout = () => {
    adminClient.logout();
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

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
    background: currentView === view ? '#1e40af' : 'transparent', // Analytics Navy
    color: currentView === view ? 'white' : '#64748b', // Text Admin Tertiary
    borderRadius: '6px',
    marginBottom: '8px',
    cursor: 'pointer',
    fontWeight: currentView === view ? 500 : 400,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    fontFamily: '"IBM Plex Sans", sans-serif'
  });

  // Render Login if not authenticated
  if (isAuthChecking) {
    return null; // Or a spinner
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Render Loading only if authenticated but data fetching
  if (loading && currentView === 'dashboard') {
    return (
      <div className="admin-layout" style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc'}}>
        <div style={{color: '#1e40af', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace'}}>
          INITIALIZING ANALYTICS SUBSYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ 
        width: '280px', 
        backgroundColor: '#0f172a', 
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div className="sidebar-header" style={{ padding: '24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
            INVENTRIO <span style={{ color: '#0d9488' }}>ANALYTICS</span>
          </div>
        </div>
        <nav style={{ padding: '24px 12px', flex: 1 }}>
          <div style={navItemStyle('dashboard')} onClick={() => setCurrentView('dashboard')}>
            <span style={{ marginRight: '10px' }}>📊</span> Dashboard
          </div>
          <div style={navItemStyle('status')} onClick={() => setCurrentView('status')}>
            <span style={{ marginRight: '10px' }}>🔌</span> System Status
          </div>
          <div style={navItemStyle('reports')} onClick={() => setCurrentView('reports')}>
             <span style={{ marginRight: '10px' }}>📑</span> Reports
          </div>
          <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '16px 0' }} />
          <div style={navItemStyle('settings')} onClick={() => setCurrentView('settings')}>
            <span style={{ marginRight: '10px' }}>🛡️</span> Admin Settings
          </div>
        </nav>
        
        {/* User / Logout Section */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>A</div>
            <div style={{ marginLeft: '12px' }}>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>Administrator</div>
              <div style={{ color: '#0d9488', fontSize: '0.75rem' }}>● Online</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: '1px solid #334155', 
              color: '#94a3b8', 
              padding: '8px', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
          >
            LOGOUT TERMINAL
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
        <header className="topbar" style={{ 
          height: '4rem', 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          <div style={{ fontWeight: 600, color: '#475569', fontSize: '1rem', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            {currentView === 'dashboard' ? 'Public Statistics Overview' : 
             currentView === 'status' ? 'System Diagnostics' : 
             currentView === 'reports' ? 'Data Reporting' : 'Administrative Configuration'}
          </div>
          <div className="status-badge" style={{ 
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            padding: '4px 12px', 
            borderRadius: '9999px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            border: '1px solid #86efac'
          }}>
            System Online
          </div>
        </header>

        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
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

          {currentView === 'settings' && <ChangeCredentialsView />}

          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: 'auto', marginBottom: '2rem', paddingTop: '4rem' }}>
            Inventrio Analytics Core v1.0.0 &bull; Secure Administrative Interface
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;