import React, { useState } from 'react';
import { fetchProductByBarcode, createTransaction, reduceInventory } from '../network';
import { getToken } from '../utils/token';

export const PointOfSale: React.FC = () => {
  const [barcode, setBarcode] = useState<string>('');
  const [cart, setCart] = useState<any[]>([]);
  const token = getToken();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchProductByBarcode(token, barcode);
      if (data.product) {
        setCart([...cart, { ...data.product, quantity: 1 }]);
        setBarcode('');
      }
    } catch (err: any) {
      alert('Product not found');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      // 1. Record Transaction
      await createTransaction(token, {
        TransactionType: 'Sale',
        payment_type: 'paid',
        amount: totalAmount,
        TransactionDate: new Date().toISOString()
      });

      // 2. Reduce Inventory for each item
      for (const item of cart) {
        await reduceInventory(token, {
          productId: item.ID,
          quantity: item.quantity
        });
      }

      setCart([]);
      alert('Transaction Complete');
    } catch (err: any) {
      alert('Checkout Failed: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Point of Sale</h1>
      <form onSubmit={handleScan}>
        <input 
          placeholder="Scan Barcode" 
          value={barcode} 
          onChange={e => setBarcode(e.target.value)} 
          autoFocus 
        />
        <button type="submit">Scan</button>
      </form>
      <div>
        <h3>Cart</h3>
        {cart.map((item, index) => (
          <div key={index}>{item.name} - ${item.price}</div>
        ))}
        <h3>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</h3>
        <button onClick={handleCheckout}>Finalize Sale</button>
      </div>
    </div>
  );
};