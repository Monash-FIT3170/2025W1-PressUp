// ui/Components/Analytics/Filters.jsx
import React from 'react';
import dayjs from 'dayjs';

const presets = {
  ALL:   { start: null, end: null, label: 'All time' },
  '30D': { start: dayjs().subtract(30, 'day').startOf('day').toDate(), end: new Date(), label: 'Last 30 days' },
  '7D':  { start: dayjs().subtract(7, 'day').startOf('day').toDate(),  end: new Date(), label: 'Last 7 days' },
  YTD:   { start: dayjs().startOf('year').toDate(), end: new Date(), label: 'YTD' }
};

export default function Filters({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
      {Object.entries(presets).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => onChange({ start: cfg.start, end: cfg.end })}
          style={{
            padding:'8px 12px',
            borderRadius:8,
            border: value.start?.toString() === cfg.start?.toString() &&
                    value.end?.toString()   === cfg.end?.toString()
                    ? '2px solid #3b82f6' : '1px solid #ddd',
            background:'#fff', cursor:'pointer'
          }}
        >{cfg.label}</button>
      ))}

      {/* Optional: manual pickers */}
      <input
        type="date"
        value={value.start ? dayjs(value.start).format('YYYY-MM-DD') : ''}
        onChange={e => onChange({ ...value, start: e.target.value ? new Date(e.target.value) : null })}
      />
      <input
        type="date"
        value={value.end ? dayjs(value.end).format('YYYY-MM-DD') : ''}
        onChange={e => onChange({ ...value, end: e.target.value ? new Date(e.target.value) : null })}
      />
      <button onClick={() => onChange({ start: null, end: null })}>Clear</button>
    </div>
  );
}
