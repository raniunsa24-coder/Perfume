import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function AdminDashboard({ user, setUser }) {

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const styles = {
  page: { minHeight: '100vh', background: '#f5f2ec', color: '#25231f', padding: '35px 5%', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15, borderBottom: '1px solid #d8d0c3', paddingBottom: 22 },
  brand: { fontSize: 23, letterSpacing: 3, fontWeight: 700 },
  muted: { color: '#827b70', fontSize: 12, letterSpacing: 1 },
  button: { background: '#29251f', color: '#fff', border: 0, padding: '12px 18px', cursor: 'pointer', letterSpacing: 1 },
  secondary: { background: 'transparent', color: '#29251f', border: '1px solid #29251f', padding: '10px 14px', cursor: 'pointer' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '28px 0' },
  tab: { padding: '12px 18px', border: '1px solid #c9c0b3', background: 'transparent', cursor: 'pointer' },
  activeTab: { background: '#29251f', color: '#fff', borderColor: '#29251f' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 15, marginBottom: 30 },
  stat: { background: '#fff', padding: 22, border: '1px solid #e5dfd5' },
  number: { fontSize: 30, margin: '12px 0 0', fontWeight: 600 },
  panel: { background: '#fff', padding: 22, border: '1px solid #e5dfd5', marginBottom: 25, overflowX: 'auto' },
  input: { width: '100%', boxSizing: 'border-box', padding: 12, border: '1px solid #d8d0c3', background: '#fff', marginTop: 7 },
  label: { display: 'block', fontSize: 11, letterSpacing: 1, marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 650 },
  cell: { padding: 13, borderBottom: '1px solid #eee8df', textAlign: 'left', fontSize: 13 },
};


  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    productCode: '',
    name: '',
    family: 'AMBER',
    price: '',
    notes: '',
    volume: '50 ML',
    tag: 'NEW',
    image: '',
    imageAlt: '',
    tone: '#a87543',
    mood: 'WARM & REFINED',
    stock: 10,
    isActive: true,
    featured: false,
  });

  const token = localStorage.getItem('eo_token');

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  }, [token]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [statsData, orderData, productData, customerData, newsletterData] =
        await Promise.all([
          request('/admin/stats'),
          request('/admin/orders'),
          request('/products?limit=100'),
          request('/admin/customers'),
          request('/admin/newsletter'),
        ]);

      setStats(statsData.stats || {});
      setOrders(orderData.orders || []);
      setProducts(productData.products || []);
      setCustomers(customerData.customers || []);
      setSubscribers(newsletterData.subscribers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/account', { replace: true });
      return;
    }
    loadDashboard();
  }, [user, navigate, loadDashboard]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      productCode: '',
      name: '',
      family: 'AMBER',
      price: '',
      notes: '',
      volume: '50 ML',
      tag: 'NEW',
      image: '',
      imageAlt: '',
      tone: '#a87543',
      mood: 'WARM & REFINED',
      stock: 10,
      isActive: true,
      featured: false,
    });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId) {
        await request(`/admin/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setMessage('Product updated successfully.');
      } else {
        await request('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Product added successfully.');
      }

      resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      productCode: product.productCode || '',
      name: product.name || '',
      family: product.family || 'AMBER',
      price: product.price ?? '',
      notes: product.notes || '',
      volume: product.volume || '50 ML',
      tag: product.tag || '',
      image: product.image || '',
      imageAlt: product.imageAlt || '',
      tone: product.tone || '#a87543',
      mood: product.mood || '',
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
      featured: product.featured ?? false,
    });
    setTab('Products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const archiveProduct = async (id) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;

    try {
      await request(`/admin/products/${id}`, { method: 'DELETE' });
      setMessage('Product archived successfully.');
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrder = async (id, status) => {
    try {
      await request(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage('Order status updated.');
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('eo_user');
    localStorage.removeItem('eo_token');
    setUser(null);
    navigate('/account');
  };

  const money = value => `$${Number(value || 0).toFixed(2)}`;

  if (!user || user.role !== 'admin') return null;

  return (
    <main className="admin-shell" style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>EMBER / OUD</div>
          <p style={styles.muted}>ADMINISTRATION · PRIVATE ACCESS</p>
        </div>
        <div>
          <span style={{ marginRight: 18, fontSize: 13 }}>
            {user.email}
          </span>
          <button style={styles.secondary} onClick={() => navigate('/')}>
            VIEW STORE
          </button>
          <button style={{ ...styles.button, marginLeft: 8 }} onClick={logout}>
            LOG OUT
          </button>
        </div>
      </header>

      <h1 style={{ fontWeight: 400, marginTop: 35 }}>
        The house <em>dashboard.</em>
      </h1>
      <p style={styles.muted}>MANAGE YOUR STORE, PRODUCTS AND ORDERS.</p>

      <nav style={styles.tabs}>
        {['Overview', 'Products', 'Orders', 'Customers', 'Newsletter'].map(item => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              ...styles.tab,
              ...(tab === item ? styles.activeTab : {}),
            }}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </nav>

      {error && (
        <div style={{ background: '#fbe8e5', padding: 14, marginBottom: 18 }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ background: '#e8f2e8', padding: 14, marginBottom: 18 }}>
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading your store data...</p>
      ) : (
        <>
          {tab === 'Overview' && (
            <>
              <div style={styles.grid}>
                {[
                  ['ACTIVE PRODUCTS', stats.products],
                  ['CUSTOMERS', stats.customers],
                  ['TOTAL ORDERS', stats.orders],
                  ['NEWSLETTER SUBSCRIBERS', stats.subscribers],
                  ['ORDER VALUE', money(stats.orderValue)],
                ].map(([label, value]) => (
                  <div style={styles.stat} key={label}>
                    <span style={styles.muted}>{label}</span>
                    <p style={styles.number}>{value ?? 0}</p>
                  </div>
                ))}
              </div>

              <section style={styles.panel}>
                <h2>Recent orders</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ORDER', 'CUSTOMER', 'TOTAL', 'STATUS', 'DATE'].map(x => (
                        <th style={styles.cell} key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map(order => (
                      <tr key={order._id}>
                        <td style={styles.cell}>{order.orderNumber}</td>
                        <td style={styles.cell}>{order.shipping?.fullName || 'Customer'}</td>
                        <td style={styles.cell}>{money(order.total)}</td>
                        <td style={styles.cell}>{order.status}</td>
                        <td style={styles.cell}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {!orders.length && (
                      <tr><td style={styles.cell} colSpan="5">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {tab === 'Products' && (
            <>
              <section style={styles.panel}>
                <h2>{editingId ? 'Edit fragrance' : 'Add a fragrance'}</h2>
                <form onSubmit={saveProduct}>
                  <div style={styles.grid}>
                    {[
                      ['productCode', 'PRODUCT CODE'],
                      ['name', 'PRODUCT NAME'],
                      ['family', 'FRAGRANCE FAMILY'],
                      ['price', 'PRICE'],
                      ['notes', 'SCENT NOTES'],
                      ['volume', 'VOLUME'],
                      ['tag', 'PRODUCT TAG'],
                      ['image', 'IMAGE URL'],
                      ['imageAlt', 'IMAGE DESCRIPTION'],
                      ['tone', 'TONE'],
                      ['mood', 'MOOD'],
                      ['stock', 'STOCK'],
                    ].map(([name, label]) => (
                      <label style={styles.label} key={name}>
                        {label}
                        <input
                          style={styles.input}
                          name={name}
                          value={form[name]}
                          onChange={updateForm}
                          required={['productCode', 'name', 'family', 'price', 'notes', 'image'].includes(name)}
                          type={['price', 'stock'].includes(name) ? 'number' : 'text'}
                          step={name === 'price' ? '0.01' : undefined}
                        />
                      </label>
                    ))}
                  </div>

                  <label style={{ marginRight: 20 }}>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm(v => ({ ...v, featured: e.target.checked }))}
                    /> Featured product
                  </label>

                  <button style={styles.button} type="submit">
                    {editingId ? 'SAVE CHANGES' : 'ADD PRODUCT'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      style={{ ...styles.secondary, marginLeft: 10 }}
                      onClick={resetForm}
                    >
                      CANCEL EDIT
                    </button>
                  )}
                </form>
              </section>

              <section style={styles.panel}>
                <h2>Product catalogue</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['PRODUCT', 'CODE', 'PRICE', 'STOCK', 'ACTION'].map(x => (
                        <th style={styles.cell} key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td style={styles.cell}>{product.name}</td>
                        <td style={styles.cell}>{product.productCode}</td>
                        <td style={styles.cell}>{money(product.price)}</td>
                        <td style={styles.cell}>{product.stock ?? 0}</td>
                        <td style={styles.cell}>
                          <button style={styles.secondary} onClick={() => editProduct(product)}>
                            EDIT
                          </button>
                          <button
                            style={{ ...styles.secondary, marginLeft: 6 }}
                            onClick={() => archiveProduct(product._id)}
                          >
                            ARCHIVE
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!products.length && (
                      <tr><td style={styles.cell} colSpan="5">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {tab === 'Orders' && (
            <section style={styles.panel}>
              <h2>All orders</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['ORDER', 'CUSTOMER', 'TOTAL', 'PAYMENT', 'STATUS', 'UPDATE'].map(x => (
                      <th style={styles.cell} key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td style={styles.cell}>{order.orderNumber}</td>
                      <td style={styles.cell}>{order.shipping?.fullName || order.user?.name || 'Customer'}</td>
                      <td style={styles.cell}>{money(order.total)}</td>
                      <td style={styles.cell}>{order.paymentStatus}</td>
                      <td style={styles.cell}>{order.status}</td>
                      <td style={styles.cell}>
                        <select
                          value={order.status}
                          onChange={e => updateOrder(order._id, e.target.value)}
                        >
                          {['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && (
                    <tr><td style={styles.cell} colSpan="6">No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {tab === 'Customers' && (
            <section style={styles.panel}>
              <h2>Customers</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['NAME', 'EMAIL', 'FRAGRANCE PROFILE', 'JOINED'].map(x => (
                      <th style={styles.cell} key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer._id}>
                      <td style={styles.cell}>{customer.name}</td>
                      <td style={styles.cell}>{customer.email}</td>
                      <td style={styles.cell}>{customer.fragranceProfile || '—'}</td>
                      <td style={styles.cell}>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!customers.length && (
                    <tr><td style={styles.cell} colSpan="4">No customers yet.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {tab === 'Newsletter' && (
            <section style={styles.panel}>
              <h2>Newsletter subscribers</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.cell}>EMAIL</th>
                    <th style={styles.cell}>DATE SUBSCRIBED</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(subscriber => (
                    <tr key={subscriber._id}>
                      <td style={styles.cell}>{subscriber.email}</td>
                      <td style={styles.cell}>
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!subscribers.length && (
                    <tr><td style={styles.cell} colSpan="2">No subscribers yet.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </main>
  );
}
