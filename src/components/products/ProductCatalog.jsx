// src/components/products/ProductCatalog.jsx
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, X, Save, Package, Tag, Ruler, DollarSign, BarChart2, FileText, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import productService from '../../services/productService';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CATEGORIES = ['Composants', 'Capteurs', 'Accessoires', 'Électronique', 'Mobilier'];
const UNITES     = ['Pièce (u)', 'Kilogramme (kg)', 'Litre (l)', 'Mètre (m)'];
const STATUTS    = ['Tous', 'OK', 'ALERTE', 'RUPTURE'];
const ITEMS_PER_PAGE = 5;
const EMPTY_FORM = { name: '', category: '', uniteMesure: 'Pièce (u)', prix: '', seuilMin: '', description: '' };

const StatusBadge = ({ statut }) => {
  const config = {
    OK:      'bg-emerald-50 text-emerald-600',
    ALERTE:  'bg-orange-50 text-orange-600',
    RUPTURE: 'bg-red-50 text-red-600',
    ACTIF:   'bg-emerald-50 text-emerald-600',
    INACTIF: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config[statut] || 'bg-gray-100 text-gray-500'}`}>
      {statut}
    </span>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
      {Icon && <Icon size={11} className="inline mr-1 mb-0.5" />}{label}
    </label>
    {children}
  </div>
);

const inputCls  = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-slate-700 outline-none focus:border-[#0F4C81] focus:bg-white transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

export default function ProductCatalog() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [filterCat,  setFilterCat]  = useState('Toutes');
  const [filterStat, setFilterStat] = useState('Tous');
  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirm,    setConfirm]    = useState({ open: false, id: null });
  const [toast,      setToast]      = useState(null);
  const formRef = useRef(null);

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat  === 'Toutes' || p.category === filterCat;
    const matchStat = filterStat === 'Tous'   || p.statut   === filterStat;
    return matchSearch && matchCat && matchStat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  useEffect(() => { setPage(1); }, [search, filterCat, filterStat]);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Le nom est obligatoire';
    if (!form.category)    errors.category = 'La catégorie est obligatoire';
    if (!form.prix || isNaN(form.prix) || Number(form.prix) < 0) errors.prix = 'Prix invalide';
    if (!form.seuilMin || isNaN(form.seuilMin) || Number(form.seuilMin) < 0) errors.seuilMin = 'Seuil invalide';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  const handleNew = () => {
    setForm(EMPTY_FORM); setEditId(null); setFormErrors({});
    setShowForm(true); scrollToForm();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name||'', category: p.category||'', uniteMesure: p.uniteMesure||'Pièce (u)', prix: p.prix??'', seuilMin: p.seuilMin??'', description: p.description||'' });
    setEditId(p.id); setFormErrors({});
    setShowForm(true); scrollToForm();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, uniteMesure: form.uniteMesure, prix: parseFloat(form.prix), seuilMin: parseInt(form.seuilMin), description: form.description.trim() };
      if (editId) { await productService.updateProduct(editId, payload); showToast('Produit mis à jour avec succès'); }
      else        { await productService.createProduct(payload);         showToast('Produit créé avec succès'); }
      await loadProducts();
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null);
    } catch (err) {
      showToast('Une erreur est survenue. Réessayez.', 'error');
      console.error(err);
    } finally { setSubmitting(false); }
  };

  const handleCancel = () => {
    setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setFormErrors({});
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(confirm.id);
      await loadProducts();
      showToast('Produit supprimé avec succès');
    } catch (err) { showToast('Erreur lors de la suppression', 'error'); }
    finally { setConfirm({ open: false, id: null }); }
  };

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (formErrors[key]) setFormErrors(e => ({ ...e, [key]: undefined }));
  };

  const stats = {
    total:   products.length,
    ok:      products.filter(p => p.statut === 'OK').length,
    alerte:  products.filter(p => p.statut === 'ALERTE').length,
    rupture: products.filter(p => p.statut === 'RUPTURE').length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total produits', value: stats.total,   color: 'text-[#0F4C81]' },
          { label: 'En stock (OK)',   value: stats.ok,      color: 'text-emerald-600' },
          { label: 'En alerte',       value: stats.alerte,  color: 'text-orange-600' },
          { label: 'En rupture',      value: stats.rupture, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className={`text-3xl font-black mt-1 ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-sm tracking-tight italic">Catalogue produits</h2>
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white text-sm font-bold rounded-lg hover:bg-[#0d3f6e] transition-colors">
            <Plus size={15} /> Nouveau produit
          </button>
        </div>

        {/* Filtres */}
        <div className="px-6 py-3 border-b border-gray-50 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-[#0F4C81] focus:bg-white transition-colors"
              placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-[#0F4C81] cursor-pointer"
            value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="Toutes">Toutes les catégories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-[#0F4C81] cursor-pointer"
            value={filterStat} onChange={e => setFilterStat(e.target.value)}>
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                {['Nom', 'Catégorie', 'Prix (FCFA)', 'Stock', 'Seuil min', 'Statut', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  <Loader size={20} className="animate-spin mx-auto mb-2" />Chargement...
                </td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-red-400 text-sm">
                  {error}<button onClick={loadProducts} className="block mx-auto mt-2 text-[#0F4C81] underline text-xs">Réessayer</button>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">Aucun produit trouvé</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500">{p.category}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{Number(p.prix).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 text-slate-700">{p.stock ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-700">{p.seuilMin}</td>
                  <td className="px-6 py-4"><StatusBadge statut={p.statut} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#0F4C81] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Edit2 size={12} /> Éditer
                      </button>
                      <button onClick={() => setConfirm({ open: true, id: p.id })} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <X size={12} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {filtered.length === 0 ? 'Aucun résultat' : <>
              Affichage de <span className="font-bold text-slate-600">{(page-1)*ITEMS_PER_PAGE+1}</span> à{' '}
              <span className="font-bold text-slate-600">{Math.min(page*ITEMS_PER_PAGE, filtered.length)}</span> sur{' '}
              <span className="font-bold text-slate-600">{filtered.length}</span> produits
            </>}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#0F4C81] hover:text-[#0F4C81] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_,i) => i+1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${n===page ? 'bg-[#0F4C81] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#0F4C81] hover:text-[#0F4C81]'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#0F4C81] hover:text-[#0F4C81] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div ref={formRef} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#0F4C81]" />
              <h3 className="font-bold text-slate-700 text-sm italic tracking-tight">
                {editId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </h3>
            </div>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Ligne 1 */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Nom du produit" icon={Package}>
                <input className={`${inputCls} ${formErrors.name ? 'border-red-400' : ''}`}
                  placeholder="ex: Batterie Lithium 12V" value={form.name} onChange={e => setField('name', e.target.value)} />
                {formErrors.name && <p className="text-red-500 text-[10px] mt-1">{formErrors.name}</p>}
              </Field>
              <Field label="Catégorie" icon={Tag}>
                <select className={`${selectCls} ${formErrors.category ? 'border-red-400' : ''}`}
                  value={form.category} onChange={e => setField('category', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {formErrors.category && <p className="text-red-500 text-[10px] mt-1">{formErrors.category}</p>}
              </Field>
              <Field label="Unité de mesure" icon={Ruler}>
                <select className={selectCls} value={form.uniteMesure} onChange={e => setField('uniteMesure', e.target.value)}>
                  {UNITES.map(u => <option key={u}>{u}</option>)}
                </select>
              </Field>
            </div>

            {/* Ligne 2 */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Prix (FCFA)" icon={DollarSign}>
                <input className={`${inputCls} ${formErrors.prix ? 'border-red-400' : ''}`}
                  type="number" min="0" placeholder="0" value={form.prix} onChange={e => setField('prix', e.target.value)} />
                {formErrors.prix && <p className="text-red-500 text-[10px] mt-1">{formErrors.prix}</p>}
              </Field>
              <Field label="Seuil minimum" icon={BarChart2}>
                <input className={`${inputCls} ${formErrors.seuilMin ? 'border-red-400' : ''}`}
                  type="number" min="0" placeholder="0" value={form.seuilMin} onChange={e => setField('seuilMin', e.target.value)} />
                {formErrors.seuilMin && <p className="text-red-500 text-[10px] mt-1">{formErrors.seuilMin}</p>}
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" icon={FileText}>
              <textarea className={`${inputCls} resize-none min-h-[80px]`}
                placeholder="Informations complémentaires sur le produit..."
                value={form.description} onChange={e => setField('description', e.target.value)} />
            </Field>

            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
              <button onClick={handleCancel} className="px-5 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0F4C81] rounded-lg hover:bg-[#0d3f6e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                {submitting
                  ? <><Loader size={14} className="animate-spin" /> Enregistrement...</>
                  : <><Save size={14} /> {editId ? 'Mettre à jour' : 'Enregistrer le produit'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
      />
    </div>
  );
}
