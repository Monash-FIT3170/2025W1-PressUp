import React, { useEffect, useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';

function money(n) {
  return `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SalesByProductTable({ onlyClosed = false, start = null, end = null, staff="all" }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    Meteor.call('analytics.salesByProduct', { onlyClosed, start, end, staff }, (err, res) => {
      setRows(err ? [] : (res || []));
    });
  }, [onlyClosed, start?.valueOf?.(), end?.valueOf?.(), staff]);

  const csv = useMemo(() => {
    const header = ['Name','Category','Qty Sold','Gross Sales','Net Profit'].join(',');
    const body = rows.map(r =>
      [r.name, r.category ?? '', r.qtySold, r.grossSales, r.netProfit].join(',')
    ).join('\n');
    return `${header}\n${body}`;
  }, [rows]);

  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h3 style={{ margin:0, fontSize:14, color:'#374151' }}>Detailed Sales by Product</h3>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="sales_by_product.csv"
          style={{ padding:'6px 10px', borderRadius:10, border:'1px solid #e5e7eb', background:'#facc15', textDecoration:'none', color:'#111' }}
        >Export</a>
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb' }}>
              <th style={{ padding:'10px 8px' }}>Name</th>
              <th style={{ padding:'10px 8px' }}>Category</th>
              <th style={{ padding:'10px 8px' }}>Qty. Sold</th>
              <th style={{ padding:'10px 8px' }}>Gross Sales</th>
              <th style={{ padding:'10px 8px' }}>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 8px' }}>{r.name}</td>
                <td style={{ padding:'10px 8px', color:'#6b7280' }}>{r.category ?? '—'}</td>
                <td style={{ padding:'10px 8px' }}>{r.qtySold}</td>
                <td style={{ padding:'10px 8px' }}>{money(r.grossSales)}</td>
                <td style={{ padding:'10px 8px' }}>{money(r.netProfit)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} style={{ padding:'14px 8px', color:'#9ca3af' }}>No data in this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
