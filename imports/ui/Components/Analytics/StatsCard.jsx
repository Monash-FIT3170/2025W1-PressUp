import React from 'react';

export default function StatsCard({ title, value, subvalue = null }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginTop: 8 }}>{value}</div>
      {subvalue && <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>{subvalue}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.03)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 120,
  }
};
