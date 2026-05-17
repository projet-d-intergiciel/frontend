// src/components/products/ProductCatalog.jsx
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, X, Save, Package, Tag, Ruler, DollarSign, BarChart2, FileText, ChevronLeft, ChevronRight, Loader, List } from 'lucide-react';
import productService from '../../services/productService';

// ── Constantes ────────────────────────────────────────────────────────────────
const CATEGORIES  = ['Composants', 'Capteurs', 'Accessoires', 'Électronique', 'Mobilier'];
const UNITES      = ['Pièce (u)', 'Kilogramme (kg)', 'Litre (l)', 'Mètre (m)'];
const STATUTS     = ['Tous', 'OK', 'ALERTE', 'RUPTURE'];
const ITEMS_PAGE  = 4;
const EMPTY_FORM  = { name: '', category: '', uniteMesure: 'Pièce (u)', prix: '', seuilMin: '', description: '' };

// ── Badge statut ──────────────────────────────────────────────────────────────
const Badge = ({ statut }) => {
  const cfg = {
    OK:      { bg: '#dcfce7', color: '#16a34a' },
    ALERTE:  { bg: '#ffedd5', color: '#ea580c' },
    RUPTURE: { bg: '#fee2e2', color: '#dc2626' },
    ACTIF:   { bg: '#dcfce7', color: '#16a34a' },
    INACTIF: { bg: '#fee2e2', color: '#dc2626' },
  };
  const s = cfg[statut] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
      {statut}
    </span>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, color: '#fff', background: toast.type === 'error' ? '#ef4444' : '#22c55e', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      {toast.message}
    </div>
  );
};

// ── Modal Confirmation ────────────────────────────────────────────────────────
const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{title}</p>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>{message}</p>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Non</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Oui, supprimer</button>
        </div>
      </div>
    </div>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────
export default function ProductCatalog() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [filterCat,  setFilterCat]  = useState('Toutes les catégories');
  const [filterStat, setFilterStat] = useState('Tous');
  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirm,    setConfirm]    = useState({ open: false, id: null });
  const [toast,      setToast]      = useState(null);
  const formRef = useRef(null);

  // ── Chargement ───────────────────────────────────────────────────────────────
  const loadProducts = async () => {
    try {
      setLoading(true); setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Impossible de charger les produits.');
      console.error(err);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadProducts(); }, []);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtrage ─────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat  === 'Toutes les catégories' || p.category  === filterCat;
    const matchStat = filterStat === 'Tous'                  || p.statut    === filterStat;
    return matchSearch && matchCat && matchStat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PAGE, page * ITEMS_PAGE);
  useEffect(() => { setPage(1); }, [search, filterCat, filterStat]);

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Obligatoire';
    if (!form.category)    e.category = 'Obligatoire';
    if (form.prix === '' || isNaN(form.prix) || Number(form.prix) < 0) e.prix = 'Invalide';
    if (form.seuilMin === '' || isNaN(form.seuilMin) || Number(form.seuilMin) < 0) e.seuilMin = 'Invalide';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  const handleNew = () => {
    setForm(EMPTY_FORM); setEditId(null); setFormErrors({});
    setShowForm(true); scrollToForm();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name || '', category: p.category || '', uniteMesure: p.uniteMesure || 'Pièce (u)', prix: p.prix ?? '', seuilMin: p.seuilMin ?? '', description: p.description || '' });
    setEditId(p.id); setFormErrors({});
    setShowForm(true); scrollToForm();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, uniteMesure: form.uniteMesure, prix: parseFloat(form.prix), seuilMin: parseInt(form.seuilMin), description: form.description.trim() };
      if (editId) { await productService.updateProduct(editId, payload); showToast('Produit mis à jour !'); }
      else        { await productService.createProduct(payload);         showToast('Produit créé !'); }
      await loadProducts();
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null);
    } catch (err) { showToast('Une erreur est survenue.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = () => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setFormErrors({}); };

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(confirm.id);
      await loadProducts();
      showToast('Produit supprimé !');
    } catch { showToast('Erreur lors de la suppression.', 'error'); }
    finally { setConfirm({ open: false, id: null }); }
  };

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (formErrors[k]) setFormErrors(e => ({ ...e, [k]: undefined })); };

  // ── Styles partagés ──────────────────────────────────────────────────────────
  const card = { background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' };
  const inputSt = (err) => ({ width: '100%', padding: '9px 12px', border: `1px solid ${err ? '#f87171' : '#e2e8f0'}`, borderRadius: 7, fontSize: 13.5, outline: 'none', color: '#1e293b', boxSizing: 'border-box', background: '#f8fafc', fontFamily: 'inherit' });
  const selectSt = (err) => ({ ...inputSt(err), cursor: 'pointer', appearance: 'none' });
  const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 };
  const errTxt = { color: '#ef4444', fontSize: 10, marginTop: 3 };

  return (
    <>
      <Toast toast={toast} />
      <ConfirmModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Catalogue produits ── */}
        <div style={card}>

          {/* Header */}
          <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Catalogue produits</span>
            <button onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} /> Nouveau produit
            </button>
          </div>

          {/* Filtres */}
          <div style={{ padding: '0 24px 14px', display: 'flex', gap: 12 }}>
            {/* Recherche */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                style={{ ...inputSt(false), paddingLeft: 36 }}
                placeholder="Rechercher un produit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Catégorie */}
            <div style={{ position: 'relative' }}>
              <select style={{ ...selectSt(false), minWidth: 170, paddingRight: 32 }}
                value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option>Toutes les catégories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Statut */}
            <div style={{ position: 'relative' }}>
              <select style={{ ...selectSt(false), minWidth: 130, paddingRight: 32 }}
                value={`Statut: ${filterStat}`}
                onChange={e => setFilterStat(e.target.value.replace('Statut: ', ''))}>
                {STATUTS.map(s => <option key={s}>{`Statut: ${s}`}</option>)}
              </select>
            </div>
          </div>

          {/* Tableau */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nom', 'Catégorie', 'Prix achat', 'Stock', 'Seuil min', 'Statut', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 24px', fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: i === 6 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader size={18} style={{ display: 'inline', marginRight: 8 }} /> Chargement...
                </td></tr>
              ) : error ? (
                <tr><td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444', fontSize: 13 }}>
                  {error} <button onClick={loadProducts} style={{ marginLeft: 8, color: '#1a3a6b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>Réessayer</button>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun produit trouvé</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>{p.name}</td>
                  <td style={{ padding: '14px 24px', color: '#475569', fontSize: 13.5 }}>{p.category}</td>
                  <td style={{ padding: '14px 24px', color: '#334155', fontSize: 13.5 }}>
                    {Number(p.prix).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} FCFA
                  </td>
                  <td style={{ padding: '14px 24px', color: '#334155', fontSize: 13.5 }}>{p.stock ?? '—'}</td>
                  <td style={{ padding: '14px 24px', color: '#334155', fontSize: 13.5 }}>{p.seuilMin}</td>
                  <td style={{ padding: '14px 24px' }}><Badge statut={p.statut} /></td>
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#1a3a6b', cursor: 'pointer', fontWeight: 600, fontSize: 13.5 }}>
                        <Edit2 size={13} /> Éditer
                      </button>
                      <button onClick={() => setConfirm({ open: true, id: p.id })}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        <X size={13} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {filtered.length === 0 ? 'Aucun résultat' : (
                <>Affichage de <b>{(page-1)*ITEMS_PAGE+1}</b> à <b>{Math.min(page*ITEMS_PAGE, filtered.length)}</b> sur <b>{filtered.length}</b> produits</>
              )}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: page===1?'not-allowed':'pointer', opacity: page===1?0.4:1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_,i) => i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: n===page?'none':'1px solid #e2e8f0', background: n===page?'#1a3a6b':'#fff', color: n===page?'#fff':'#475569', cursor: 'pointer', fontWeight: n===page?700:400, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: page===totalPages?'not-allowed':'pointer', opacity: page===totalPages?0.4:1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Formulaire ── */}
        {showForm && (
          <div ref={formRef} style={{ ...card }}>
            {/* Header formulaire */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <List size={16} color="#1a3a6b" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Formulaire — {editId ? 'Éditer' : 'Ajouter'} un produit
                </span>
              </div>
              <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Ligne 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={label}>Nom du produit</label>
                  <input style={inputSt(formErrors.name)} placeholder="ex: MacBook Pro"
                    value={form.name} onChange={e => setField('name', e.target.value)} />
                  {formErrors.name && <p style={errTxt}>{formErrors.name}</p>}
                </div>
                <div>
  <label style={label}>Catégorie</label>
  <input
    list="categories-list"
    style={selectSt(formErrors.category)}
    value={form.category}
    onChange={e => setField('category', e.target.value)}
    placeholder="Sélectionner ou écrire une catégorie..."
  />
  <datalist id="categories-list">
    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
  </datalist>
  {formErrors.category && <p style={errTxt}>{formErrors.category}</p>}
</div>
                <div>
                  <label style={label}>Unité de mesure</label>
                  <select style={selectSt(false)} value={form.uniteMesure} onChange={e => setField('uniteMesure', e.target.value)}>
                    {UNITES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Ligne 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={label}>Prix achat (FCFA)</label>
                  <input style={inputSt(formErrors.prix)} type="number" min="0" placeholder="0.00"
                    value={form.prix} onChange={e => setField('prix', e.target.value)} />
                  {formErrors.prix && <p style={errTxt}>{formErrors.prix}</p>}
                </div>
                <div>
                  <label style={label}>Seuil minimum</label>
                  <input style={inputSt(formErrors.seuilMin)} type="number" min="0" placeholder="0"
                    value={form.seuilMin} onChange={e => setField('seuilMin', e.target.value)} />
                  {formErrors.seuilMin && <p style={errTxt}>{formErrors.seuilMin}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={label}>Description</label>
                <textarea style={{ ...inputSt(false), resize: 'vertical', minHeight: 90 }}
                  placeholder="Informations complémentaires sur le produit..."
                  value={form.description} onChange={e => setField('description', e.target.value)} />
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={handleCancel}
                  style={{ padding: '9px 20px', border: '1px solid #e2e8f0', borderRadius: 7, background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', border: 'none', borderRadius: 7, background: '#1a3a6b', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting
                    ? <><Loader size={14} /> Enregistrement...</>
                    : <><Save size={14} /> {editId ? 'Mettre à jour' : 'Enregistrer le produit'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
