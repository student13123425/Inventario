import React from 'react';
import { MetricCard } from './DashboardView';

const SystemStatusView: React.FC = () => {
  return (
    <div className="page-content">
      <div className="section-header">
        <h1>System Status</h1>
      </div>
      <div className="subtitle">
        Real-time infrastructure monitoring and health checks.
      </div>

      <div className="dashboard-grid">
        <MetricCard 
          title="Server Uptime" 
          value="99.98%" 
          subtext="Last restart: 14h ago"
          trend="up"
        />
        <MetricCard 
          title="Stats File IO" 
          value="2ms" 
          subtext="Write latency"
          trend="neutral"
        />
        <MetricCard 
          title="Database Core" 
          value="Mounted" 
          subtext="SQLite 3.x"
          trend="up"
        />
        <MetricCard 
          title="Auto-Save Interval" 
          value="6 Hours" 
          subtext="Next: 14:00 UTC"
          trend="neutral"
        />

        <div className="admin-card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">Service Status</div>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { name: 'Express API Host', status: 'Listening (3000)', color: 'var(--c-success)' },
                { name: 'SQLite Connection', status: 'Connected', color: 'var(--c-success)' },
                { name: 'Stats Collector', status: 'Idle', color: 'var(--c-info)' },
                { name: 'File System (fs)', status: 'Writable', color: 'var(--c-success)' },
              ].map((service, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{service.name}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: service.color, fontWeight: 600 }}>{service.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">Recent Server Log Events</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>
            <div style={{ marginBottom: '8px' }}>[12:45:02] INFO: Serving GET /api/public/stats (200 OK)</div>
            <div style={{ marginBottom: '8px' }}>[12:00:01] INFO: Statistics saved to /data/stats.json</div>
            <div style={{ marginBottom: '8px' }}>[12:00:00] INFO: Starting statistics collection...</div>
            <div style={{ marginBottom: '8px' }}>[06:00:00] INFO: Auto-save routine triggered (Interval: 6h)</div>
            <div style={{ marginBottom: '8px' }}>[00:00:01] INFO: Database initialized successfully (users.db)</div>
            <div>[00:00:00] INFO: Server running on http://localhost:3000</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusView;