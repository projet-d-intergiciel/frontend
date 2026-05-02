import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import StatusBadge from '../../components/orders/StatusBadge';

const CYCLE = ['BROUILLON', 'VALIDEE', 'RECUE', 'EXPEDIEE', 'CLOTUREE'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      setOrder(await orderService.getById(id));
    } catch {
      setError('Commande introuvable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, [id]);

  const handleAction = async (action) => {
    if (!window.confirm(`Confirmer : ${action} cette commande ?`)) return;
    try {
      await orderService[action](id);
      charger();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de l\'action.');
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error)   return <div style={styles.error}>{error}</div>;
  if (!order)  return null;

  const stepIndex = CYCLE.indexOf(order.status);

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <button style={styles.btnBack} onClick={() => navigate('/orders')}>← Retour</button>
          <h1 style={styles.title}>{order.reference}</h1>
          <div style={styles.metaRow}>
            <StatusBadge status={order.status} />
            <span style={styles.meta}>Type : <strong>{order.type?.replace(/_/g, ' ')}</strong></span>
            <span style={styles.meta}>Créé par : <strong>{order.createdBy}</strong></span>
            {order.fournisseurOuClient && (
              <span style={styles.meta}>Tiers : <strong>{order.fournisseurOuClient}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Indicateur progression */}
      {order.status !== 'ANNULEE' && (
        <div style={styles.progressBar}>
          {CYCLE.map((s, i) => (
            <React.Fragment key={s}>
              <div style={styles.stepItem}>
                <div style={{
                  ...styles.stepCircle,
                  background: i <= stepIndex ? '#0d6efd' : '#dee2e6',
                  color: i <= stepIndex ? '#fff' : '#999',
                }}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span style={{ ...styles.stepLabel, color: i <= stepIndex ? '#0d6efd' : '#999' }}>
                  {s}
                </span>
              </div>
              {i < CYCLE.length - 1 && (
                <div style={{ ...styles.stepLine, background: i < stepIndex ? '#0d6efd' : '#dee2e6' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={styles.body}>
        {/* Articles */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📦 Articles ({order.items?.length ?? 0})</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Quantité</th>
                <th style={styles.th}>Prix unitaire</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, i) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}><strong>{item.productName}</strong></td>
                  <td style={styles.td}>#{item.productId}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>{item.unitPrice != null ? `${item.unitPrice} FCFA` : '—'}</td>
                  <td style={styles.td}>
                    {item.unitPrice != null ? `${(item.unitPrice * item.quantity).toFixed(2)} FCFA` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Infos & dates */}
        <div style={styles.sidePanel}>
          {order.notes && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📝 Notes</h3>
              <p style={styles.notes}>{order.notes}</p>
            </div>
          )}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Dates</h3>
            <table style={styles.datesTable}>
              <tbody>
                {[
                  ['Créée le', order.createdAt],
                  ['Validée le', order.validatedAt],
                  ['Reçue le', order.receivedAt],
                  ['Expédiée le', order.shippedAt],
                ].map(([label, date]) => date ? (
                  <tr key={label}>
                    <td style={styles.dateLabel}>{label}</td>
                    <td style={styles.dateVal}>{new Date(date).toLocaleString('fr-FR')}</td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
          </div>

          {/* Actions disponibles */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚡ Actions</h3>
            <div style={styles.actionsStack}>
              {order.status === 'BROUILLON' &&
                <button style={styles.btnAction('#0d6efd')} onClick={() => handleAction('valider')}>✅ Valider la commande</button>}
              {order.status === 'VALIDEE' &&
                <button style={styles.btnAction('#198754')} onClick={() => handleAction('recevoir')}>📥 Marquer comme reçue</button>}
              {['VALIDEE','RECUE'].includes(order.status) &&
                <button style={styles.btnAction('#fd7e14')} onClick={() => handleAction('expedier')}>🚚 Marquer comme expédiée</button>}
              {['EXPEDIEE','RECUE'].includes(order.status) &&
                <button style={styles.btnAction('#6f42c1')} onClick={() => handleAction('cloturer')}>🔒 Clôturer</button>}
              {!['CLOTUREE','ANNULEE'].includes(order.status) &&
                <button style={styles.btnAction('#dc3545')} onClick={() => handleAction('annuler')}>❌ Annuler</button>}
              {['CLOTUREE','ANNULEE'].includes(order.status) &&
                <p style={{ color: '#888', fontSize: '0.88rem', margin: 0 }}>Aucune action disponible.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:   { padding: '24px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '1100px', margin: '0 auto' },
  loading:     { padding: '40px', textAlign: 'center', color: '#666' },
  error:       { padding: '20px', background: '#f8d7da', color: '#842029', borderRadius: '8px', margin: '24px' },
  header:      { marginBottom: '24px' },
  btnBack:     { background: 'none', border: 'none', cursor: 'pointer', color: '#0d6efd', fontSize: '0.9rem', padding: 0, marginBottom: '8px' },
  title:       { fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: '8px 0' },
  metaRow:     { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
  meta:        { fontSize: '0.88rem', color: '#555' },
  progressBar: { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e9ecef', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', overflowX: 'auto' },
  stepItem:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px' },
  stepCircle:  { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' },
  stepLabel:   { fontSize: '0.72rem', fontWeight: '600', textAlign: 'center' },
  stepLine:    { flex: 1, height: '2px', minWidth: '20px', marginBottom: '20px' },
  body:        { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' },
  card:        { background: '#fff', border: '1px solid #e9ecef', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardTitle:   { fontSize: '0.95rem', fontWeight: '700', color: '#495057', margin: '0 0 16px 0' },
  sidePanel:   {},
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '0.82rem', color: '#666', borderBottom: '2px solid #dee2e6' },
  tr:          { borderBottom: '1px solid #f0f0f0' },
  td:          { padding: '10px 12px', fontSize: '0.88rem' },
  notes:       { color: '#555', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 },
  datesTable:  { width: '100%', borderCollapse: 'collapse' },
  dateLabel:   { padding: '6px 0', fontSize: '0.82rem', color: '#888', paddingRight: '12px' },
  dateVal:     { padding: '6px 0', fontSize: '0.82rem', color: '#333', fontWeight: '500' },
  actionsStack:{ display: 'flex', flexDirection: 'column', gap: '8px' },
  btnAction:   (color) => ({
    padding: '10px 16px', background: color, color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', textAlign: 'left',
  }),
};
