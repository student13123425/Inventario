import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct } from '../network';
import { getToken } from '../utils/token';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    nation_of_origin: '',
    product_bar_code: '',
    expiration_date: ''
  });
  const token = getToken();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    fetchProducts(token).then(data => setProducts(data.products || []));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(token, {
        ...form,
        price: parseFloat(form.price),
        expiration_date: form.expiration_date ? new Date(form.expiration_date).getTime() : undefined
      });
      loadProducts();
      setForm({ name: '', price: '', nation_of_origin: '', product_bar_code: '', expiration_date: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Product Catalog</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
        <input placeholder="Origin" value={form.nation_of_origin} onChange={e => setForm({...form, nation_of_origin: e.target.value})} />
        <input placeholder="Barcode" value={form.product_bar_code} onChange={e => setForm({...form, product_bar_code: e.target.value})} required />
        <button type="submit">Create Product</button>
      </form>
      <ul>
        {products.map(p => (
          <li key={p.ID}>{p.name} - ${p.price} (Bar: {p.product_bar_code})</li>
        ))}
      </ul>
    </div>
  );
};