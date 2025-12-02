// components/tables/TopProductsTable.tsx
import React from 'react';
import type { TopProductData } from './script/objects';

interface TopProductsTableProps {
  data: TopProductData[];
  limit: number;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ data, limit }) => {
  const sortedData = [...data]
    .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
    .slice(0, limit);

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product</th>
            <th>Barcode</th>
            <th>Quantity Sold</th>
            <th>Sale Occurrences</th>
            <th>Avg Price</th>
            <th>Estimated Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((product, index) => (
            <tr key={product.ID}>
              <td className="numeric-cell">
                <div className={`rank-badge rank-${index + 1}`}>
                  {index + 1}
                </div>
              </td>
              <td className="text-cell">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                </div>
              </td>
              <td className="text-cell font-mono">
                {product.product_bar_code}
              </td>
              <td className="numeric-cell">
                {product.total_quantity_sold.toLocaleString()}
              </td>
              <td className="numeric-cell">
                {product.sale_occurrences}
              </td>
              <td className="numeric-cell">
                ${product.avg_sale_price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
              <td className="numeric-cell">
                <div className="revenue-cell">
                  <span className="revenue-value">
                    ${product.estimated_revenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <span className="revenue-trend">
                    {/* Add trend indicator if available */}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="empty-state">
          <p className="empty-text">No product sales data available</p>
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;