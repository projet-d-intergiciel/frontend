import React from 'react';

const STATUS_CONFIG = {
  BROUILLON:  { label: 'Brouillon',  color: '#6c757d', bg: '#f8f9fa' },
  VALIDEE:    { label: 'Validée',    color: '#0d6efd', bg: '#cfe2ff' },
  RECUE:      { label: 'Reçue',      color: '#198754', bg: '#d1e7dd' },
  EXPEDIEE:   { label: 'Expédiée',   color: '#fd7e14', bg: '#ffe5d0' },
  CLOTUREE:   { label: 'Clôturée',   color: '#6f42c1', bg: '#e2d9f3' },
  ANNULEE:    { label: 'Annulée',    color: '#dc3545', bg: '#f8d7da' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#333', bg: '#eee' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.78rem',
      fontWeight: '600',
      color: cfg.color,
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.color}33`,
    }}>
      {cfg.label}
    </span>
  );
}
