import React, { useState, useEffect } from 'react';
import { fetchProducts, addInventoryBatch } from '../network';
import { getToken } from '../utils/token';

export const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    ProductID: '',
    purchase_price: '',
    sale_price: '',
    quantity: '',
    expiration_date_per_batch: ''
  });
  const token = getToken();

  useEffect(() => {
    fetchProducts(token).then(data => setProducts(data.products || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInventoryBatch(token, {
        ProductID: parseInt(form.ProductID),
        purchase_price: parseFloat(form.purchase_price),
        sale_price: parseFloat(form.sale_price),
        quantity: parseInt(form.quantity),
        expiration_date_per_batch: form.expiration_date_per_batch
      });
      alert('Batch Added');
      setForm({ ProductID: '', purchase_price: '', sale_price: '', quantity: '', expiration_date_per_batch: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Inventory Manager</h1>
      <form onSubmit={handleSubmit}>
        <select value={form.ProductID} onChange={e => setForm({...form, ProductID: e.target.value})} required>
          <option value="">Select Product</option>
          {products.map(p => <option key={p.ID} value={p.ID}>{p.name}</option>)}
        </select>
        <input placeholder="Purchase Cost" type="number" value={form.purchase_price} onChange={e => setForm({...form, purchase_price: e.target.value})} required />
        <input placeholder="Sale Price" type="number" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} required />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
        <input type="date" value={form.expiration_date_per_batch} onChange={e => setForm({...form, expiration_date_per_batch: e.target.value})} />
        <button type="submit">Add Stock Batch</button>
      </form>
    </div>
  );
};