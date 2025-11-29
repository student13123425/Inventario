import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, fetchSuppliers, createSupplier } from '../network';
import { getToken } from '../utils/token';

export const CRM: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '' });
  const [suppForm, setSuppForm] = useState({ Name: '', phone: '', email: '' });
  const token = getToken();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchCustomers(token).then(data => setCustomers(data.customers || []));
    fetchSuppliers(token).then(data => setSuppliers(data.suppliers || []));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCustomer(token, { name: custForm.name, phone_number: custForm.phone, email: custForm.email });
    loadData();
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupplier(token, { Name: suppForm.Name, phone_number: suppForm.phone, email: suppForm.email });
    loadData();
  };

  return (
    <div>
      <h1>CRM</h1>
      <section>
        <h2>Customers</h2>
        <form onSubmit={handleCreateCustomer}>
          <input placeholder="Name" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
          <input placeholder="Phone" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
          <button type="submit">Add Customer</button>
        </form>
        <ul>{customers.map(c => <li key={c.ID}>{c.name}</li>)}</ul>
      </section>
      <section>
        <h2>Suppliers</h2>
        <form onSubmit={handleCreateSupplier}>
          <input placeholder="Name" value={suppForm.Name} onChange={e => setSuppForm({...suppForm, Name: e.target.value})} />
          <input placeholder="Phone" value={suppForm.phone} onChange={e => setSuppForm({...suppForm, phone: e.target.value})} />
          <button type="submit">Add Supplier</button>
        </form>
        <ul>{suppliers.map(s => <li key={s.ID}>{s.Name}</li>)}</ul>
      </section>
    </div>
  );
};