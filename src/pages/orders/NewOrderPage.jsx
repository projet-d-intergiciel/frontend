import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const TYPES = ['ENTREE_FOURNISSEUR', 'SORTIE_CLIENT', 'INTERNE'];

const emptyItem = () => ({ productId: '', productName: '', quantity: 1, unitPrice: '' });

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'ENTREE_FOURNISSEUR',
    fournisseurOuClient: '',
    notes: '',
    items: [emptyItem()],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setItem = (idx, field, value) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const ajouterItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const supprimerItem = (idx) => setForm((f) => ({
    ...f,
    items: f.items.filter((_, i) => i !== idx),
  }));

  const valider = () => {
    const e = {};
    if (!form.type) e.type = 'Le type est obligatoire';
    form.items.forEach((item, i) => {
      if (!item.productId) e[`item_${i}_productId`] = 'ID requis';
      if (!item.productName) e[`item_${i}_productName`] = 'Nom requis';
      if (!item.quantity || item.quantity < 1) e[`item_${i}_quantity`] = 'Qté > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!valider()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: form.items.map((it) => ({
          ...it,
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          unitPrice: it.unitPrice ? Number(it.unitPrice) : null,
        })),
      };
      const created = await orderService.creer(payload);
      navigate(`/orders/${created.id}`);
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur lors de la création.';
      setErrors({ global: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* En-tête */}
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>➕ Nouvelle Commande</h2>
          <button style={styles.btnBack} onClick={() => navigate('/orders')}>← Retour</button>
        </div>

        {errors.global && <div style={styles.errorBox}>{errors.global}</div>}

        {/* Section infos générales */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Informations générales</h3>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Type de commande *</label>
              <select
                style={errors.type ? { ...styles.input, ...styles.inputError } : styles.input}
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              {errors.type && <span style={styles.errorMsg}>{errors.type}</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>
                {form.type === 'ENTREE_FOURNISSEUR' ? 'Fournisseur' : 'Client'}
              </label>
              <input
                style={styles.input}
                placeholder={form.type === 'ENTREE_FOURNISSEUR' ? 'Nom du fournisseur' : 'Nom du client'}
                value={form.fournisseurOuClient}
                onChange={(e) => setField('fournisseurOuClient', e.target.value)}
              />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              placeholder="Observations, instructions particulières..."
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>
        </section>

        {/* Section articles */}
        <section style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionTitle}>Articles ({form.items.length})</h3>
            <button style={styles.btnAdd} onClick={ajouterItem}>+ Ajouter un article</button>
          </div>

          {form.items.map((item, idx) => (
            <div key={idx} style={styles.itemRow}>
              <div style={styles.itemIndex}>#{idx + 1}</div>

              <div style={{ flex: 1 }}>
                <div style={styles.grid4}>
                  <div style={styles.field}>
                    <label style={styles.labelSm}>ID Produit *</label>
                    <input
                      style={errors[`item_${idx}_productId`] ? { ...styles.inputSm, ...styles.inputError } : styles.inputSm}
                      type="number"
                      placeholder="ID"
                      value={item.productId}
                      onChange={(e) => setItem(idx, 'productId', e.target.value)}
                    />
                    {errors[`item_${idx}_productId`] && <span style={styles.errorMsg}>{errors[`item_${idx}_productId`]}</span>}
                  </div>
                  <div style={{ ...styles.field, flex: 2 }}>
                    <label style={styles.labelSm}>Nom du produit *</label>
                    <input
                      style={errors[`item_${idx}_productName`] ? { ...styles.inputSm, ...styles.inputError } : styles.inputSm}
                      placeholder="Nom du produit"
                      value={item.productName}
                      onChange={(e) => setItem(idx, 'productName', e.target.value)}
                    />
                    {errors[`item_${idx}_productName`] && <span style={styles.errorMsg}>{errors[`item_${idx}_productName`]}</span>}
                  </div>
                  <div style={styles.field}>
                    <label style={styles.labelSm}>Quantité *</label>
                    <input
                      style={errors[`item_${idx}_quantity`] ? { ...styles.inputSm, ...styles.inputError } : styles.inputSm}
                      type="number"
                      min="1"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                    />
                    {errors[`item_${idx}_quantity`] && <span style={styles.errorMsg}>{errors[`item_${idx}_quantity`]}</span>}
                  </div>
                  <div style={styles.field}>
                    <label style={styles.labelSm}>Prix unitaire</label>
                    <input
                      style={styles.inputSm}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => setItem(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {form.items.length > 1 && (
                <button style={styles.btnRemove} onClick={() => supprimerItem(idx)} title="Supprimer">✕</button>
              )}
            </div>
          ))}
        </section>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.btnCancel} onClick={() => navigate('/orders')} disabled={loading}>
            Annuler
          </button>
          <button style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : '💾 Créer la commande'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:       { padding: '24px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '900px', margin: '0 auto' },
  card:            { background: '#fff', borderRadius: '16px', border: '1px solid #e9ecef', overflow: 'hidden' },
  cardHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' },
  title:           { fontSize: '1.3rem', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  btnBack:         { background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#555', fontSize: '0.9rem' },
  section:         { padding: '24px 28px', borderBottom: '1px solid #f0f0f0' },
  sectionTitle:    { fontSize: '1rem', fontWeight: '700', color: '#495057', marginBottom: '16px', marginTop: 0 },
  sectionHeaderRow:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  grid2:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  grid4:           { display: 'grid', gridTemplateColumns: '80px 1fr 80px 100px', gap: '8px', alignItems: 'start' },
  field:           { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:           { fontSize: '0.85rem', fontWeight: '600', color: '#495057' },
  labelSm:         { fontSize: '0.78rem', fontWeight: '600', color: '#666' },
  input:           { padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  inputSm:         { padding: '8px 10px', border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  inputError:      { borderColor: '#dc3545' },
  errorMsg:        { fontSize: '0.75rem', color: '#dc3545', marginTop: '2px' },
  errorBox:        { background: '#f8d7da', color: '#842029', padding: '12px 16px', borderBottom: '1px solid #f5c2c7' },
  itemRow:         { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '10px' },
  itemIndex:       { width: '28px', height: '28px', background: '#0d6efd', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.78rem', flexShrink: 0, marginTop: '22px' },
  btnAdd:          { padding: '7px 14px', background: '#d1e7dd', color: '#198754', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  btnRemove:       { background: '#f8d7da', color: '#dc3545', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: '700', flexShrink: 0, marginTop: '22px' },
  actions:         { padding: '20px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btnCancel:       { padding: '10px 24px', background: '#f1f3f5', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  btnSubmit:       { padding: '10px 28px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
};
