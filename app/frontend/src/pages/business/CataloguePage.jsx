import React, { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import styles from './CataloguePage.module.css';

const EMPTY = { name: '', category: '', price: '', description: '', inStock: true };

export default function CataloguePage() {
  const { catalogue, addProduct, updateProduct } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addProduct({ ...form, price: Number(form.price) || 0 });
    setForm(EMPTY);
    setShowForm(false);
  }

  return (
    <div>
      <h1 className="page-title">Product Catalogue</h1>
      <p className="page-sub">Products available for use in customer journeys. Prices and stock are verified before presenting offers.</p>

      <div className={styles.toolbar}>
        <span className={styles.count}>{catalogue.length} product{catalogue.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add product'}
        </button>
      </div>

      {showForm && (
        <form className={`card ${styles.form}`} onSubmit={submit}>
          <h3 className={styles.formTitle}>Add product</h3>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Name * <input className={styles.input} required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. House Blend 250g" />
            </label>
            <label className={styles.label}>
              Category <input className={styles.input} value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Coffee" />
            </label>
            <label className={styles.label}>
              Price ($) <input className={styles.input} type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </label>
            <label className={`${styles.label} ${styles.checkLabel}`}>
              <span>In stock</span>
              <input type="checkbox" checked={form.inStock}
                onChange={e => setForm({ ...form, inStock: e.target.checked })} />
            </label>
            <label className={`${styles.label} ${styles.full}`}>
              Description <input className={styles.input} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief product description" />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Add to catalogue</button>
          <p className={styles.subtle}>Product claims must come from verified merchant information. Do not present unverified offers.</p>
        </form>
      )}

      {catalogue.length === 0 ? (
        <div className={`card ${styles.empty}`}>No products yet. Add products above or load demo data during onboarding.</div>
      ) : (
        <div className={styles.grid}>
          {catalogue.map(p => <ProductCard key={p.id} product={p} onUpdate={updateProduct} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p, onUpdate }) {
  return (
    <div className={`card ${styles.pCard}`}>
      <div className={styles.pHeader}>
        <div>
          <div className={styles.pName}>{p.name}</div>
          {p.category && <div className={styles.pCategory}>{p.category}</div>}
        </div>
        <div className={styles.pPrice}>${Number(p.price).toFixed(2)}</div>
      </div>
      {p.description && <p className={styles.pDesc}>{p.description}</p>}
      <div className={styles.pFooter}>
        <span className={`badge ${p.inStock ? 'badge-green' : 'badge-red'}`}>
          {p.inStock ? 'In stock' : 'Out of stock'}
        </span>
        <button
          className={`btn btn-ghost btn-sm`}
          onClick={() => onUpdate(p.id, { inStock: !p.inStock })}
        >
          {p.inStock ? 'Mark out of stock' : 'Mark in stock'}
        </button>
      </div>
    </div>
  );
}
