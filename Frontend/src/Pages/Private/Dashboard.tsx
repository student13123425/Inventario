import React, { useState, useEffect } from 'react';
import { fetchLowStockAlerts, fetchDailySales } from '../network';
import { getToken } from '../utils/token';

export const Dashboard: React.FC = () => {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<number>(0);
  const token = getToken();

  useEffect(() => {
    fetchLowStockAlerts(token).then(data => setLowStock(data.lowStockAlerts || []));
    fetchDailySales(token).then(data => setDailySales(data.dailySales || 0));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>Daily Sales</h2>
        <p>${dailySales}</p>
      </section>
      <section>
        <h2>Low Stock Alerts</h2>
        <ul>
          {lowStock.map(item => (
            <li key={item.ID}>{item.name}: {item.total_quantity} remaining</li>
          ))}
        </ul>
      </section>
    </div>
  );
};