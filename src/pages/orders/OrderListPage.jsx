import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import StatusBadge from '../../components/orders/StatusBadge';

const STATUTS = ['', 'BROUILLON', 'VALIDEE', 'RECUE', 'EXPEDIEE', 'CLOTUREE', 'ANNULEE'];
const TYPES   = ['', 'ENTREE_FOURNISSEUR', 'SORTIE_CLIENT', 'INTERNE'];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    status: '', type: '', page: 0, size: 10,
  });

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      if (!params.status) delete params.status;
      if (!params.type)   delete params.type;
      const data = await orderService.lister(params);
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch {
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { charger(); }, [charger]);

  const handleAction = async (action, id) => {
    if (!window.confirm(`Confirmer l'action : ${action} ?`)) return;
    try {
      await orderService[action](id);
      charger();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de l\'action.');
    }
  };

  const actionsDisponibles = (order) => {
    const actions = [];
    if (order.status === 'BROUILLON')             actions.push({ key: 'valider',  label: '✅ Valider',   style: 'primary' });
    if (order.status === 'VALIDEE')               actions.push({ key: 'recevoir', label: '📥 Recevoir',  style: 'success' });
    if (['VALIDEE','RECUE'].includes(order.status)) actions.push({ key: 'expedier', label: '🚚 Expédier', style: 'warning' });
    if (['EXPEDIEE','RECUE'].includes(order.status)) actions.push({ key: 'cloturer', label: '🔒 Clôturer', style: 'purple' });
    if (!['CLOTUREE','ANNULEE'].includes(order.status)) actions.push({ key: 'annuler', label: '❌ Annuler', style: 'danger' });
    return actions;
  };

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Gestion des Commandes</h1>
          <p style={styles.subtitle}>Suivi du cycle de vie des commandes</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => navigate('/orders/new')}>
          + Nouvelle commande
        </button>
      </div>

      {/* Filtres */}
      <div style={styles.filtersBar}>
        <select
          style={styles.select}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}>
          {STATUTS.map(s => <option key={s} value={s}>{s || 'Tous les statuts'}</option>)}
        </select>
        <select
          style={styles.select}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 0 })}>
          {TYPES.map(t => <option key={t} value={t}>{t || 'Tous les types'}</option>)}
        </select>
        <button style={styles.btnSecondary} onClick={charger}>🔄 Actualiser</button>
      </div>

      {/* Erreur */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Tableau */}
      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Référence</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Créé par</th>
                <th style={styles.th}>Fournisseur/Client</th>
                <th style={styles.th}>Articles</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>
                    <button
                      style={styles.refLink}
                      onClick={() => navigate(`/orders/${order.id}`)}>
                      {order.reference}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>{order.type?.replace('_', ' ')}</span>
                  </td>
                  <td style={styles.td}><StatusBadge status={order.status} /></td>
                  <td style={styles.td}>{order.createdBy}</td>
                  <td style={styles.td}>{order.fournisseurOuClient || '—'}</td>
                  <td style={styles.td}>{order.items?.length ?? 0} article(s)</td>
                  <td style={styles.td}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      {actionsDisponibles(order).map((a) => (
                        <button
                          key={a.key}
                          style={{ ...styles.actionBtn, ...styles[`btn_${a.style}`] }}
                          onClick={() => handleAction(a.key, order.id)}
                          title={a.label}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
            ← Précédent
          </button>
          <span style={styles.pageInfo}>Page {filters.page + 1} / {totalPages}</span>
          <button
            style={styles.pageBtn}
            disabled={filters.page >= totalPages - 1}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:    { padding: '24px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '1200px', margin: '0 auto' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:        { fontSize: '1.6rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  subtitle:     { color: '#666', marginTop: '4px', fontSize: '0.9rem' },
  filtersBar:   { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  select:       { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', minWidth: '180px' },
  btnPrimary:   { padding: '10px 20px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { padding: '8px 16px', background: '#f1f3f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  error:        { background: '#f8d7da', color: '#842029', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' },
  loading:      { textAlign: 'center', padding: '40px', color: '#666' },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', border: '1px solid #e9ecef' },
  table:        { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  thead:        { background: '#f8f9fa' },
  th:           { padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', color: '#495057', borderBottom: '2px solid #dee2e6' },
  tr:           { borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' },
  td:           { padding: '12px 16px', fontSize: '0.88rem', verticalAlign: 'middle' },
  refLink:      { background: 'none', border: 'none', cursor: 'pointer', color: '#0d6efd', fontWeight: '600', textDecoration: 'underline', fontSize: '0.88rem' },
  typeBadge:    { fontSize: '0.78rem', color: '#495057', background: '#f1f3f5', padding: '2px 8px', borderRadius: '6px' },
  actionsCell:  { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  actionBtn:    { padding: '4px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' },
  btn_primary:  { background: '#cfe2ff', color: '#0d6efd' },
  btn_success:  { background: '#d1e7dd', color: '#198754' },
  btn_warning:  { background: '#ffe5d0', color: '#fd7e14' },
  btn_purple:   { background: '#e2d9f3', color: '#6f42c1' },
  btn_danger:   { background: '#f8d7da', color: '#dc3545' },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  pageBtn:      { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: '#fff' },
  pageInfo:     { color: '#666', fontSize: '0.9rem' },
};
