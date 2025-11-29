import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '../network';
import { getToken } from '../utils/token';

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const token = getToken();

  useEffect(() => {
    fetchTransactions(token).then(data => setTransactions(data.transactions || []));
  }, []);

  return (
    <div>
      <h1>Transaction Ledger</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.ID}>
              <td>{new Date(t.TransactionDate).toLocaleDateString()}</td>
              <td>{t.TransactionType}</td>
              <td>${t.amount}</td>
              <td>{t.payment_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};