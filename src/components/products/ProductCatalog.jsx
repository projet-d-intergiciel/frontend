import { useState } from "react";

const initialProducts = [
  { id: 1, nom: "MacBook Pro 14\"", categorie: "Électronique", prixAchat: 185.0, prixVente: 219.0, seuilMin: 5, statut: "ACTIF" },
  { id: 2, nom: "Clavier Logitech MX", categorie: "Accessoires", prixAchat: 75.0, prixVente: 119.0, seuilMin: 15, statut: "ACTIF" },
  { id: 3, nom: "Chaise Ergonomique V2", categorie: "Mobilier", prixAchat: 210.0, prixVente: 349.0, seuilMin: 10, statut: "ACTIF" },
  { id: 4, nom: "Écran Dell UltraSharp 27", categorie: "Électronique", prixAchat: 420.0, prixVente: 599.0, seuilMin: 8, statut: "ACTIF" },
  { id: 5, nom: "Souris Magic Mouse", categorie: "Accessoires", prixAchat: 55.0, prixVente: 89.0, seuilMin: 20, statut: "ACTIF" },
  { id: 6, nom: "Bureau Standing Desk", categorie: "Mobilier", prixAchat: 380.0, prixVente: 599.0, seuilMin: 3, statut: "ACTIF" },
];

const categories = ["Toutes les catégories", "Électronique", "Accessoires", "Mobilier", "Agroalimentaire"];
const statuts = ["Tous", "ACTIF", "INACTIF"];
const unites = ["Pièce (u)", "Kilogramme (kg)", "Litre (l)", "Mètre (m)"];
const ITEMS_PER_PAGE = 4;

const emptyForm = {
  nom: "", categorie: "", uniteMesure: "Pièce (u)",
  prixAchat: "", prixVente: "", seuilMin: "", description: "",
};

// ── Icons (inline SVG) ─────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Products: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  Stock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  ChevLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  FormIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  ChevDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

const fmt = (n) =>
  Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " FCFA";

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Toutes les catégories");
  const [filterStat, setFilterStat] = useState("Tous");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [activeNav, setActiveNav] = useState("Produits");
  const [showForm, setShowForm] = useState(true);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Toutes les catégories" || p.categorie === filterCat;
    const matchStat = filterStat === "Tous" || p.statut === filterStat;
    return matchSearch && matchCat && matchStat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setForm({
      nom: p.nom, categorie: p.categorie, uniteMesure: "Pièce (u)",
      prixAchat: p.prixAchat, prixVente: p.prixVente,
      seuilMin: p.seuilMin, description: "",
    });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 9999, behavior: "smooth" });
  };

  const handleNewProduct = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.nom.trim()) return;
    if (editId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? { ...p, nom: form.nom, categorie: form.categorie,
                prixAchat: parseFloat(form.prixAchat) || 0,
                prixVente: parseFloat(form.prixVente) || 0,
                seuilMin: parseInt(form.seuilMin) || 0 }
            : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { id: Date.now(), nom: form.nom, categorie: form.categorie,
          prixAchat: parseFloat(form.prixAchat) || 0,
          prixVente: parseFloat(form.prixVente) || 0,
          seuilMin: parseInt(form.seuilMin) || 0, statut: "ACTIF" },
      ]);
    }
    setForm(emptyForm);
    setEditId(null);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const navItems = [
    { label: "Dashboard", icon: <Icon.Dashboard /> },
    { label: "Produits", icon: <Icon.Products /> },
    { label: "Stock", icon: <Icon.Stock /> },
    { label: "Commandes", icon: <Icon.Cart /> },
    { label: "Notifications", icon: <Icon.Bell /> },
    { label: "Utilisateurs", icon: <Icon.Users /> },
  ];

  // ── Styles ───────────────────────────────────────────────────────────────
  const S = {
    root: {
      display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif",
      fontSize: "14px", background: "#f1f5f9", color: "#1e293b",
    },
    // Sidebar
    sidebar: {
      width: "180px", minWidth: "180px", background: "#fff",
      borderRight: "1px solid #e2e8f0", display: "flex",
      flexDirection: "column", padding: "0",
    },
    logo: {
      padding: "20px 20px 16px", fontWeight: "700", fontSize: "17px",
      color: "#1d4ed8", borderBottom: "1px solid #e2e8f0", letterSpacing: "-0.3px",
    },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: "10px",
      padding: "11px 20px", cursor: "pointer", fontSize: "13.5px",
      background: active ? "#eff6ff" : "transparent",
      color: active ? "#2563eb" : "#475569",
      borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
      fontWeight: active ? "600" : "400",
      transition: "all 0.15s",
    }),
    // Main
    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
    topbar: {
      background: "#fff", borderBottom: "1px solid #e2e8f0",
      padding: "14px 28px", display: "flex", justifyContent: "flex-end",
      alignItems: "center", gap: "14px",
    },
    topbarIcon: {
      width: "36px", height: "36px", borderRadius: "50%",
      border: "1px solid #e2e8f0", display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer", color: "#64748b",
      background: "#f8fafc",
    },
    avatar: {
      width: "36px", height: "36px", borderRadius: "50%",
      background: "#1d4ed8", color: "#fff", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontWeight: "700", fontSize: "14px",
    },
    content: { padding: "28px", display: "flex", flexDirection: "column", gap: "24px" },
    // Card
    card: {
      background: "#fff", borderRadius: "10px",
      border: "1px solid #e2e8f0", overflow: "hidden",
    },
    cardHeader: {
      padding: "20px 24px 16px", display: "flex",
      justifyContent: "space-between", alignItems: "center",
    },
    cardTitle: { fontSize: "17px", fontWeight: "700", color: "#0f172a" },
    btnPrimary: {
      display: "flex", alignItems: "center", gap: "7px",
      background: "#2563eb", color: "#fff", border: "none",
      borderRadius: "7px", padding: "9px 16px", fontSize: "13.5px",
      fontWeight: "600", cursor: "pointer",
    },
    // Filters
    filters: {
      padding: "0 24px 16px", display: "flex", gap: "12px", alignItems: "center",
    },
    searchWrap: {
      flex: 1, position: "relative", display: "flex", alignItems: "center",
    },
    searchIcon: {
      position: "absolute", left: "12px", color: "#94a3b8", pointerEvents: "none",
    },
    searchInput: {
      width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0",
      borderRadius: "7px", fontSize: "13.5px", outline: "none",
      background: "#f8fafc", color: "#1e293b", boxSizing: "border-box",
    },
    select: {
      padding: "9px 32px 9px 12px", border: "1px solid #e2e8f0",
      borderRadius: "7px", fontSize: "13.5px", background: "#f8fafc",
      color: "#1e293b", cursor: "pointer", outline: "none",
      appearance: "none", minWidth: "160px",
    },
    selectWrap: { position: "relative", display: "inline-block" },
    selectChev: {
      position: "absolute", right: "10px", top: "50%",
      transform: "translateY(-50%)", pointerEvents: "none",
    },
    // Table
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left", padding: "10px 24px", fontSize: "12.5px",
      fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0",
      background: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.04em",
    },
    td: {
      padding: "14px 24px", borderBottom: "1px solid #f1f5f9",
      fontSize: "13.5px", color: "#334155",
    },
    badgeActif: {
      display: "inline-block", padding: "3px 10px", borderRadius: "20px",
      fontSize: "12px", fontWeight: "600",
      background: "#dcfce7", color: "#16a34a",
    },
    badgeInactif: {
      display: "inline-block", padding: "3px 10px", borderRadius: "20px",
      fontSize: "12px", fontWeight: "600",
      background: "#fee2e2", color: "#dc2626",
    },
    btnEdit: {
      background: "none", border: "none", color: "#2563eb",
      cursor: "pointer", fontWeight: "600", fontSize: "13.5px",
      display: "flex", alignItems: "center", gap: "5px",
    },
    // Pagination
    pagination: {
      padding: "14px 24px", display: "flex", justifyContent: "space-between",
      alignItems: "center", borderTop: "1px solid #f1f5f9",
    },
    paginInfo: { fontSize: "13px", color: "#64748b" },
    paginButtons: { display: "flex", gap: "6px", alignItems: "center" },
    paginBtn: (active) => ({
      width: "32px", height: "32px", borderRadius: "6px",
      border: active ? "none" : "1px solid #e2e8f0",
      background: active ? "#2563eb" : "#fff",
      color: active ? "#fff" : "#475569",
      cursor: "pointer", fontWeight: active ? "700" : "400",
      fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center",
    }),
    // Form
    formCard: {
      background: "#fff", borderRadius: "10px",
      border: "1px solid #e2e8f0", padding: "24px",
    },
    formHeader: {
      display: "flex", alignItems: "center", gap: "10px",
      marginBottom: "20px", paddingBottom: "16px",
      borderBottom: "1px solid #f1f5f9",
    },
    formTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
    formGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      gap: "16px", marginBottom: "16px",
    },
    formGrid2: {
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      gap: "16px", marginBottom: "16px",
    },
    label: {
      display: "block", fontSize: "12.5px", fontWeight: "600",
      color: "#475569", marginBottom: "6px",
    },
    input: {
      width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
      borderRadius: "7px", fontSize: "13.5px", outline: "none",
      color: "#1e293b", boxSizing: "border-box", background: "#f8fafc",
    },
    textarea: {
      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
      borderRadius: "7px", fontSize: "13.5px", outline: "none",
      color: "#1e293b", boxSizing: "border-box", background: "#f8fafc",
      resize: "vertical", minHeight: "90px", fontFamily: "inherit",
    },
    formActions: {
      display: "flex", justifyContent: "flex-end",
      gap: "10px", marginTop: "20px", paddingTop: "16px",
      borderTop: "1px solid #f1f5f9",
    },
    btnSecondary: {
      padding: "9px 20px", border: "1px solid #e2e8f0",
      borderRadius: "7px", background: "#fff", color: "#475569",
      fontSize: "13.5px", fontWeight: "600", cursor: "pointer",
    },
  };

  const SelectField = ({ value, onChange, options, style }) => (
    <div style={S.selectWrap}>
      <select value={value} onChange={onChange} style={{ ...S.select, ...style }}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <span style={S.selectChev}><Icon.ChevDown /></span>
    </div>
  );

  return (
    <div style={S.root}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.logo}>StockManager</div>
        {navItems.map(({ label, icon }) => (
          <div key={label} style={S.navItem(activeNav === label)}
            onClick={() => setActiveNav(label)}>
            {icon}{label}
          </div>
        ))}
      </aside>

      {/* ── Main ── */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={S.topbarIcon}><Icon.Bell /></div>
          <div style={S.avatar}>M</div>
        </div>

        {/* Content */}
        <div style={S.content}>

          {/* ── Table Card ── */}
          <div style={S.card}>
            {/* Header */}
            <div style={S.cardHeader}>
              <span style={S.cardTitle}>Catalogue produits</span>
              <button style={S.btnPrimary} onClick={handleNewProduct}>
                <Icon.Plus /> Nouveau produit
              </button>
            </div>

            {/* Filters */}
            <div style={S.filters}>
              <div style={S.searchWrap}>
                <span style={S.searchIcon}><Icon.Search /></span>
                <input
                  style={S.searchInput}
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <SelectField
                value={filterCat}
                onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
                options={categories}
              />
              <SelectField
                value={`Statut: ${filterStat}`}
                onChange={(e) => {
                  setFilterStat(e.target.value.replace("Statut: ", ""));
                  setPage(1);
                }}
                options={statuts.map((s) => `Statut: ${s}`)}
              />
            </div>

            {/* Table */}
            <table style={S.table}>
              <thead>
                <tr>
                  {["Nom", "Catégorie", "Prix achat", "Prix vente", "Seuil min", "Statut", "Actions"].map((h) => (
                    <th key={h} style={{ ...S.th, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: "32px" }}>
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : paginated.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ ...S.td, fontWeight: "500", color: "#0f172a" }}>{p.nom}</td>
                    <td style={S.td}>{p.categorie}</td>
                    <td style={S.td}>{fmt(p.prixAchat)}</td>
                    <td style={S.td}>{fmt(p.prixVente)}</td>
                    <td style={S.td}>{p.seuilMin}</td>
                    <td style={S.td}>
                      <span style={p.statut === "ACTIF" ? S.badgeActif : S.badgeInactif}>
                        {p.statut}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      <button style={S.btnEdit} onClick={() => handleEdit(p)}>
                        <Icon.Edit /> Éditer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={S.pagination}>
              <span style={S.paginInfo}>
                Affichage de {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} à{" "}
                {Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} produits
              </span>
              <div style={S.paginButtons}>
                <button style={S.paginBtn(false)}
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <Icon.ChevLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} style={S.paginBtn(n === page)} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
                <button style={S.paginBtn(false)}
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <Icon.ChevRight />
                </button>
              </div>
            </div>
          </div>

          {/* ── Form Card ── */}
          {showForm && (
            <div style={S.formCard}>
              <div style={S.formHeader}>
                <Icon.FormIcon />
                <span style={S.formTitle}>
                  Formulaire — {editId ? "Éditer" : "Ajouter"} un produit
                </span>
              </div>

              {/* Row 1 */}
              <div style={S.formGrid}>
                <div>
                  <label style={S.label}>Nom du produit</label>
                  <input style={S.input} placeholder="ex: MacBook Pro"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Catégorie</label>
                  <div style={S.selectWrap}>
                    <select style={{ ...S.select, width: "100%", minWidth: 0 }}
                      value={form.categorie}
                      onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                      <option value="">Sélectionner...</option>
                      {["Électronique", "Accessoires", "Mobilier", "Agroalimentaire"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <span style={S.selectChev}><Icon.ChevDown /></span>
                  </div>
                </div>
                <div>
                  <label style={S.label}>Unité de mesure</label>
                  <div style={S.selectWrap}>
                    <select style={{ ...S.select, width: "100%", minWidth: 0 }}
                      value={form.uniteMesure}
                      onChange={(e) => setForm({ ...form, uniteMesure: e.target.value })}>
                      {unites.map((u) => <option key={u}>{u}</option>)}
                    </select>
                    <span style={S.selectChev}><Icon.ChevDown /></span>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div style={S.formGrid2}>
                <div>
                  <label style={S.label}>Prix achat (FCFA)</label>
                  <input style={S.input} type="number" placeholder="0.00" min="0" step="0.01"
                    value={form.prixAchat}
                    onChange={(e) => setForm({ ...form, prixAchat: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Prix vente (FCFA)</label>
                  <input style={S.input} type="number" placeholder="0.00" min="0" step="0.01"
                    value={form.prixVente}
                    onChange={(e) => setForm({ ...form, prixVente: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Seuil minimum</label>
                  <input style={S.input} type="number" placeholder="0" min="0"
                    value={form.seuilMin}
                    onChange={(e) => setForm({ ...form, seuilMin: e.target.value })} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={S.label}>Description</label>
                <textarea style={S.textarea}
                  placeholder="Informations complémentaires sur le produit..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Actions */}
              <div style={S.formActions}>
                <button style={S.btnSecondary} onClick={handleCancel}>Annuler</button>
                <button style={S.btnPrimary} onClick={handleSubmit}>
                  {editId ? "Mettre à jour" : "Enregistrer le produit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
