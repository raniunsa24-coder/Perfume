import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart,
  Menu, Minus, Plus, Search, ShoppingBag, Sparkles, SprayCan,
  UserRound, Wind, X, Eye, EyeOff, LockKeyhole
} from 'lucide-react';
import { products as catalogue } from './data.js';

const money = n => `$${Number(n).toFixed(0)}`;

function App() {
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState('');

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eo_user'));
    } catch {
      return null;
    }
  });

  const notify = message => {
    setToast(message);
    window.clearTimeout(window.__eoToast);
    window.__eoToast = window.setTimeout(() => setToast(''), 2600);
  };

  const add = product => {
    setBag(current =>
      current.some(item => item.id === product.id)
        ? current.map(item =>
            item.id === product.id
              ? { ...item, qty: item.qty + 1 }
              : item
          )
        : [...current, { ...product, qty: 1 }]
    );
    notify(`${product.name} added to your bag`);
  };

  const bagCount = bag.reduce((sum, item) => sum + item.qty, 0);

  return <>
    <div className="announcement">
      <span>COMPLIMENTARY SHIPPING ON ORDERS OVER $150</span>
      <span className="announcement-center">A STUDY IN SCENT, SKIN & MEMORY</span>
      <span>INDEPENDENT PERFUMERY <i>✳</i></span>
    </div>

    <header className="header">
      <button
        className="mobile-menu"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Open menu"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <nav className={`nav nav-left ${menuOpen ? 'nav-visible' : ''}`}>
        <a href="/#shop" onClick={() => setMenuOpen(false)}>SHOP ALL</a>
        <a href="/#story" onClick={() => setMenuOpen(false)}>THE HOUSE</a>
        <a href="/#notes" onClick={() => setMenuOpen(false)}>SCENT NOTES</a>
      </nav>

      <Link to="/" className="wordmark" aria-label="Ember Oud home">
        <span className="wordmark-icon">E<span>✳</span>O</span>
        <span className="wordmark-name">
          EMBER / OUD
          <small>THE ART OF LEAVING A TRACE</small>
        </span>
      </Link>

      <div className="nav nav-right">
        <Link to="/account" className="header-link">
          <UserRound />
          <span>
            {user?.name
              ? user.name.split(' ')[0].toUpperCase()
              : 'ACCOUNT'}
          </span>
        </Link>

        <button className="bag-button" onClick={() => setBagOpen(true)}>
          <ShoppingBag />
          <span>BAG</span>
          <b>{bagCount}</b>
        </button>
      </div>
    </header>

    <Routes>
      <Route
        path="/"
        element={
          <Home
            add={add}
            wishlist={wishlist}
            setWishlist={setWishlist}
            notify={notify}
          />
        }
      />

      <Route
        path="/account"
        element={
          <Account
            user={user}
            setUser={setUser}
            notify={notify}
          />
        }
      />

      {/* Admin route: user and setUser must be passed to AdminDashboard */}
      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AdminDashboard
              user={user}
              setUser={setUser}
            />
          ) : (
            <Navigate to="/account" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Home
            add={add}
            wishlist={wishlist}
            setWishlist={setWishlist}
            notify={notify}
          />
        }
      />
    </Routes>

    <footer className="footer">
      <div className="footer-top">
        <span>THE LAST THING THEY REMEMBER.</span>
        <span className="footer-flower">✳</span>
        <span>THE FIRST THING YOU FEEL.</span>
      </div>

      <div className="footer-main">
        <div className="footer-intro">
          <Link to="/" className="wordmark footer-mark">
            <span className="wordmark-icon">E<span>✳</span>O</span>
            <span className="wordmark-name">
              EMBER / OUD
              <small>THE ART OF LEAVING A TRACE</small>
            </span>
          </Link>
          <p>Not made to fill a room.<br /><em>Made to change it.</em></p>
        </div>

        <div>
          <b>THE HOUSE</b>
          <a href="/#shop">All fragrances</a>
          <a href="/#story">Our point of view</a>
          <a href="/#notes">The scent journal</a>
        </div>

        <div>
          <b>YOUR RITUAL</b>
          <Link to="/account">Your account</Link>
          <a href="mailto:hello@ember-oud.example">Speak to the atelier</a>
          <a href="/#newsletter">Letters from the house</a>
        </div>

        <div className="footer-monogram">E/O<span>✳</span></div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 EMBER / OUD</span>
        <span>INDEPENDENT BY NATURE</span>
        <span>SCENT LEAVES A TRACE.</span>
      </div>
    </footer>

    <AnimatePresence>
      {bagOpen && (
        <BagDrawer
          bag={bag}
          setBag={setBag}
          user={user}
          close={() => setBagOpen(false)}
          notify={notify}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <Check size={15} />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  </>;
}

function SprayEffect({ active = false, dense = false }) {
  return (
    <div
      className={`spray-effect ${active ? 'spray-active' : ''} ${dense ? 'spray-dense' : ''}`}
      aria-hidden="true"
    >
      <span className="spray-cloud" />
      {Array.from({ length: dense ? 28 : 18 }, (_, i) => (
        <i
          key={i}
          style={{
            '--i': i,
            '--angle': `${-42 + i * (dense ? 3.2 : 5)}deg`,
            '--delay': `${(i % 7) * -.31}s`
          }}
        />
      ))}
      <b>SCENT IN MOTION</b>
    </div>
  );
}

function HeroPerfume({ onSpray }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`hero-product-stage ${hover ? 'bottle-hovered' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(v => !v)}
    >
      <div className="stage-sun" />
      <div className="stage-ring ring-a" />
      <div className="stage-ring ring-b" />
      <div className="stage-ring ring-c" />

      <motion.div
        className="hero-photo-frame"
        animate={{
          y: [0, -12, 0],
          rotate: [-1.4, 1.2, -1.4],
          scale: hover ? 1.075 : 1
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: .55 }
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=92"
          alt="Amber perfume bottle photographed in dramatic golden light"
        />
        <div className="photo-glint" />
        <div className="photo-caption">
          <span>EAU DE PARFUM</span>
          <b>50 ML / 1.7 FL.OZ</b>
        </div>
      </motion.div>

      <SprayEffect active dense />

      <div className="stage-label label-top">
        <span>OBJECT Nº 08</span>
        <i>✳</i>
      </div>

      <div className="stage-label label-bottom">
        <span>THE SIGNATURE STUDY</span>
        <span>01 — 06</span>
      </div>

      <motion.div
        className="orbit-tag"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100">
          <defs>
            <path
              id="orbit-text"
              d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
            />
          </defs>
          <text>
            <textPath href="#orbit-text">
              MADE TO LINGER · EMBER / OUD · MADE TO LINGER ·
            </textPath>
          </text>
        </svg>
        <span>✳</span>
      </motion.div>

      <button className="spray-button" onClick={onSpray}>
        <span className="spray-button-icon"><SprayCan size={20} /></span>
        <span>
          <small>DON'T JUST LOOK</small>
          <b>RELEASE THE SCENT</b>
        </span>
        <ArrowUpRight size={18} />
      </button>

      <div className="stage-side-note">
        AN OBJECT OF DESIRE <i>—</i> 2026
      </div>
    </div>
  );
}

function Home({ add, wishlist, setWishlist, notify }) {
  const [products, setProducts] = useState(catalogue);
  const [spraying, setSpraying] = useState(false);
  const [filter, setFilter] = useState('ALL SCENTS');
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const spray = () => {
    setSpraying(true);
    window.setTimeout(() => setSpraying(false), 2100);
  };

  useEffect(() => {
    const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

    fetch(`${api}/products?limit=100`)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (Array.isArray(data?.products) && data.products.length) {
          setProducts(
            data.products.map(product => ({
              ...product,
              id: product.productCode || product._id,
              productCode: product.productCode || product._id
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () => products.filter(p =>
      (filter === 'ALL SCENTS' || p.family.includes(filter)) &&
      `${p.name} ${p.family} ${p.notes}`.toLowerCase().includes(search.toLowerCase())
    ),
    [products, filter, search]
  );

  return (
    <main>
      <section className={`hero ${spraying ? 'hero-spraying' : ''}`}>
        <div className="hero-texture" />

        <div className="hero-topline">
          <span>INDEPENDENT PERFUMERY / EST. 2026</span>
          <span>THE SCENT ISSUE <i>№ 001</i></span>
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            <span /> FOR THE BEAUTIFULLY UNFORGETTABLE
          </div>
          <h1>Leave<br />a <em>trace.</em></h1>
          <p>
            Some things are remembered long after they've disappeared.
            We bottle that feeling.
          </p>
          <a className="primary-link" href="#shop">
            <span>DISCOVER YOUR SIGNATURE</span>
            <ArrowDown size={16} />
          </a>
          <div className="hero-footnote">
            <span>01 / THE ART OF ARRIVAL</span>
            <span>FORMULATED TO BE FELT.</span>
          </div>
        </div>

        <HeroPerfume onSpray={spray} />

        <div className="hero-number">E/O <span>—</span> 08</div>
        <div className="hero-scroll">
          <span>SCROLL TO FEEL SOMETHING</span>
          <i />
        </div>
      </section>

      <div className="marquee" aria-label="Fragrance made personal">
        <div className="marquee-track">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              NOT A PERFUME. A PRESENCE <i>✳</i>
              A MEMORY IN THE MAKING <i>✳</i>
              SKIN, SMOKE & SOMETHING ELSE <i>✳</i>
            </span>
          ))}
        </div>
      </div>

      <section className="manifesto" id="story">
        <div className="section-label">
          <span>01 / THE HOUSE</span>
          <span>OUR POINT OF VIEW</span>
        </div>

        <div className="manifesto-grid">
          <div className="manifesto-symbol">✳<span>e/o</span></div>

          <div className="manifesto-head">
            <p className="eyebrow">A DIFFERENT KIND OF SIGNATURE</p>
            <h2>Wear the<br /><em>unspoken.</em></h2>
          </div>

          <div className="manifesto-copy">
            <p>
              We believe fragrance should feel like a secret you choose to share.
              Unexpected pairings. Beautiful raw materials. Compositions that
              unfold differently on every skin.
            </p>
            <p>
              Made for the ones who never needed to announce themselves —
              but are impossible to forget.
            </p>
            <a className="text-arrow" href="#notes">
              OUR WAY OF MAKING <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="manifesto-bottom">
          <span>SMALL BATCH / BIG FEELING</span>
          <span>NO RULES. JUST NOTES.</span>
          <span>ALWAYS PERSONAL.</span>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-label">
          <span>02 / THE SCENT INDEX</span>
          <span>COMPOSITIONS Nº 01—06</span>
        </div>

        <div className="shop-heading">
          <div>
            <p className="eyebrow">FIND YOUR ATMOSPHERE</p>
            <h2>Meet your<br /><em>other self.</em></h2>
          </div>
          <p className="shop-intro">
            Six original compositions. Each one an invitation to be a little
            less predictable.
          </p>
        </div>

        <div className="shop-controls">
          <div className="filter-list">
            {['ALL SCENTS', 'AMBER', 'GREEN', 'FRUIT', 'RESIN', 'FLORAL', 'CITRUS'].map(item => (
              <button
                key={item}
                className={filter === item ? 'filter-active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="search-field">
            <Search size={15} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Find a feeling"
            />
            <span>↵</span>
          </label>
        </div>

        <div className="product-grid">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              add={add}
              wishlist={wishlist}
              setWishlist={setWishlist}
              notify={notify}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="empty-results">
            No scent found for that feeling. Try another note.
          </div>
        )}

        <div className="shop-bottom">
          <span>MADE IN SMALL BATCHES · NEVER ORDINARY</span>
          <span>
            {String(filtered.length).padStart(2, '0')} COMPOSITIONS <i>✳</i>
          </span>
        </div>
      </section>

      <section className="note-editorial" id="notes">
        <div className="editorial-photo">
          <img
            src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1300&q=90"
            alt="Amber fragrance bottle surrounded by warm, moody light"
          />
          <div className="editorial-photo-overlay" />
          <div className="editorial-stamp">
            <span>THE</span>
            <b>NOTE<br />STUDY</b>
            <i>VOL. 01</i>
          </div>
          <span className="editorial-photo-caption">RAW MATERIAL Nº 04 — RESIN</span>
          <SprayEffect active dense />
        </div>

        <div className="editorial-copy">
          <div className="section-label">
            <span>03 / NOTES IN FOCUS</span>
            <span>THE COMPOSITION</span>
          </div>

          <p className="eyebrow">A LITTLE SCIENCE. A LOT OF FEELING.</p>
          <h2>It starts<br />with a <em>note.</em></h2>

          <p className="editorial-description">
            A scent isn't a straight line. It moves, shifts, settles. The first
            breath is an introduction; the dry-down is the part that becomes yours.
          </p>

          <div className="note-list">
            <div>
              <span>01</span>
              <b>THE OPENING</b>
              <p>Bright citrus, green stems, a spark of possibility.</p>
              <i>TOP NOTES</i>
            </div>
            <div>
              <span>02</span>
              <b>THE HEART</b>
              <p>Petals, spice and the unexpected in-between.</p>
              <i>MIDDLE NOTES</i>
            </div>
            <div>
              <span>03</span>
              <b>THE MEMORY</b>
              <p>Warm woods, skin musk and a trace that stays.</p>
              <i>BASE NOTES</i>
            </div>
          </div>

          <a className="text-arrow" href="#shop">
            EXPLORE THE COMPOSITIONS <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section className="quote-section">
        <span className="quote-star">✳</span>
        <p>“A room changes<br />when <em>you</em> arrive.”</p>
        <span>THE EMBER / OUD IDEA OF FRAGRANCE</span>
        <div className="quote-orb orb-left" />
        <div className="quote-orb orb-right" />
      </section>

      <section className="newsletter" id="newsletter">
        <div className="newsletter-mark">e<span>✳</span>o</div>

        <div className="newsletter-copy">
          <p className="eyebrow">LETTERS FROM THE HOUSE</p>
          <h2>Stay in the<br /><em>atmosphere.</em></h2>
          <p>
            New compositions, notes worth knowing, and little things we think
            you'll love. Never noise.
          </p>
        </div>

        <form
          className="newsletter-form"
          onSubmit={async e => {
            e.preventDefault();

            try {
              const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

              const response = await fetch(`${api}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'homepage' })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Could not subscribe right now.');
              }

              setSubscribed(true);
              notify(data.message || 'You are on the list. Keep your senses open.');
            } catch (error) {
              notify(
                error.message === 'Failed to fetch'
                  ? 'Newsletter service is offline. Start the backend first.'
                  : error.message
              );
            }
          }}
        >
          <label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label>

          <div>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              required
            />
            <button aria-label="Subscribe">
              <ArrowUpRight size={20} />
            </button>
          </div>

          <small>
            {subscribed
              ? 'YOU ARE ON THE LIST. KEEP YOUR SENSES OPEN.'
              : 'NO SPAM. JUST GOOD TASTE.'}
          </small>
        </form>

        <div className="newsletter-grain" />
      </section>
    </main>
  );
}

function ProductCard({ product, index, add, wishlist, setWishlist, notify }) {
  const [hover, setHover] = useState(false);
  const [spray, setSpray] = useState(false);

  const wished = wishlist.includes(product.id);

  const release = () => {
    setSpray(true);
    window.setTimeout(() => setSpray(false), 1550);
  };

  return (
    <motion.article
      className={`product-card ${hover ? 'product-hover' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .12 }}
      transition={{ duration: .65, delay: (index % 3) * .1 }}
      onMouseEnter={() => {
        setHover(true);
        release();
      }}
      onMouseLeave={() => setHover(false)}
    >
      <div className="product-image" style={{ '--tone': product.tone }}>
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          onError={event => {
            const image = event.currentTarget;

            if (!image.dataset.fallback) {
              image.dataset.fallback = '1';
              image.src = product.name === 'Rose After Hours'
                ? 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?auto=format&fit=crop&w=1100&q=90'
                : 'https://images.unsplash.com/photo-1618436623771-29df2e27f809?auto=format&fit=crop&w=1100&q=90';
            }
          }}
        />

        <div className="product-image-shade" />

        <div className="product-topline">
          <span>{product.tag}</span>
          <button
            className={`wishlist ${wished ? 'wished' : ''}`}
            onClick={() => {
              setWishlist(list =>
                wished
                  ? list.filter(id => id !== product.id)
                  : [...list, product.id]
              );
              notify(wished
                ? 'Removed from your saved scents'
                : 'Saved to your scent list');
            }}
            aria-label="Save fragrance"
          >
            <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </div>

        <SprayEffect active={spray} dense />

        <button className="product-spray" onClick={release}>
          <Wind size={15} />
          <span>RELEASE SCENT</span>
        </button>

        <button className="product-add" onClick={() => add(product)}>
          <span>ADD TO BAG</span>
          <b>{money(product.price)}</b>
          <Plus size={16} />
        </button>

        <span className="product-index">
          E/O — {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="product-info">
        <div>
          <span className="product-family">{product.family}</span>
          <h3>{product.name}</h3>
          <p>{product.notes}</p>
        </div>
        <strong>{money(product.price)}</strong>
      </div>

      <div className="product-meta">
        <span>{product.volume}</span>
        <span>{product.mood}</span>
      </div>
    </motion.article>
  );
}

function Account({ user, setUser, notify }) {
  const [mode, setMode] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    profile: 'WOODY & WARM',
    terms: false
  });

  const navigate = useNavigate();

  const strength = [
    form.password.length >= 8,
    /[A-Z]/.test(form.password),
    /[0-9]/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password)
  ].filter(Boolean).length;

  const update = e => {
    setForm(v => ({
      ...v,
      [e.target.name]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value
    }));
  };

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !form.terms) {
      return setError('Please agree to the house terms to continue.');
    }

    if (mode === 'register' && form.password !== form.confirm) {
      return setError('Those passwords do not match yet.');
    }

    if (form.password.length < 8) {
      return setError('Use at least 8 characters for your password.');
    }

    setBusy(true);

    try {
      const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

      const response = await fetch(
        `${api}/auth/${mode === 'register' ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            mode === 'register'
              ? {
                  name: form.name,
                  email: form.email,
                  password: form.password,
                  fragranceProfile: form.profile
                }
              : {
                  email: form.email,
                  password: form.password
                }
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not access the account.');
      }

      localStorage.setItem('eo_token', data.token);
      localStorage.setItem('eo_user', JSON.stringify(data.user));

      setUser(data.user);

      notify(
        mode === 'register'
          ? 'Welcome to the house.'
          : 'Welcome back.'
      );

      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Account service is offline. Configure and start the backend to continue.'
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <main className="account-page">
        <div className="account-image-panel">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=90"
            alt="Amber fragrance bottle"
          />
          <SprayEffect active dense />

          <div className="account-image-copy">
            <span>PRIVATE ACCESS / 001</span>
            <h1>Your scent.<br /><em>Your story.</em></h1>
            <p>Some rituals are worth keeping.</p>
          </div>
        </div>

        <div className="account-form-panel">
          <span className="eyebrow">WELCOME TO THE HOUSE</span>
          <h2>Hello,<br /><em>{user.name?.split(' ')[0]}.</em></h2>
          <p>Your fragrance story continues here.</p>

          <div className="account-detail">
            <span>EMAIL ADDRESS</span>
            <b>{user.email}</b>
          </div>

          <div className="account-detail">
            <span>SCENT TEMPERAMENT</span>
            <b>{user.fragranceProfile || 'YOUR OWN STORY'}</b>
          </div>

          <button
            className="form-submit"
            onClick={() => {
              localStorage.removeItem('eo_user');
              localStorage.removeItem('eo_token');
              setUser(null);
              notify('Signed out successfully.');
            }}
          >
            SIGN OUT <ArrowRight size={17} />
          </button>

          <Link className="back-home" to="/">
            BACK TO THE HOUSE <ArrowUpRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-image-panel">
        <img
          src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=90"
          alt="Perfume bottle in warm cinematic light"
        />

        <div className="account-image-vignette" />
        <SprayEffect active dense />

        <div className="account-image-copy">
          <span>EMBER / OUD — PRIVATE ACCESS</span>
          <h1>Make an<br /><em>entrance.</em></h1>
          <p>Even when you're not in the room.</p>
          <div className="account-side-caption">A SCENT IS A SIGNATURE.</div>
        </div>

        <div className="account-image-index">E/O <i>✳</i> 001</div>
      </div>

      <div className="account-form-panel">
        <div className="account-form-top">
          <Link to="/" className="back-home">
            <ArrowDown size={15} /> BACK TO THE HOUSE
          </Link>
          <span>PRIVATE ACCESS <i>✳</i></span>
        </div>

        <p className="eyebrow">
          {mode === 'register'
            ? 'YOUR OWN LITTLE UNIVERSE'
            : 'GOOD TO HAVE YOU BACK'}
        </p>

        <h2>
          {mode === 'register' ? 'Make it' : 'Come'}
          <br />
          <em>{mode === 'register' ? 'personal.' : 'closer.'}</em>
        </h2>

        <p className="account-intro">
          {mode === 'register'
            ? 'Create your scent profile. No two people leave the same trace.'
            : 'Your fragrance story is right where you left it.'}
        </p>

        <div className="account-tabs">
          <button
            className={mode === 'register' ? 'selected' : ''}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            CREATE ACCOUNT <span>01</span>
          </button>

          <button
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            SIGN IN <span>02</span>
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              <span>01 / WHAT DO WE CALL YOU?</span>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            <span>{mode === 'register' ? '02' : '01'} / EMAIL ADDRESS</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@somewhere.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>{mode === 'register' ? '03' : '02'} / MAKE A PASSWORD</span>

            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={update}
                placeholder="At least 8 characters"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength="8"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <>
              <div className="password-strength">
                <span>PASSWORD STRENGTH</span>
                <div>
                  {[0, 1, 2, 3].map(n => (
                    <i
                      key={n}
                      className={strength > n ? 'filled' : ''}
                    />
                  ))}
                </div>
                <b>{['—', 'SOFT', 'FAIR', 'GOOD', 'STRONG'][strength]}</b>
              </div>

              <label>
                <span>04 / YOUR FRAGRANCE TEMPERAMENT</span>
                <select
                  name="profile"
                  value={form.profile}
                  onChange={update}
                >
                  <option>WOODY & WARM</option>
                  <option>FRESH & GREEN</option>
                  <option>AMBER & SPICED</option>
                  <option>FLORAL & SOFT</option>
                  <option>DARK & UNEXPECTED</option>
                </select>
                <small>Just a starting point. Never a rule.</small>
              </label>

              <label className="terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={update}
                />
                <span>
                  I'm good with the house terms and the occasional scent letter.
                </span>
              </label>

              <label>
                <span>05 / ONE MORE TIME</span>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={update}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="form-submit" disabled={busy}>
            {busy
              ? 'ONE MOMENT…'
              : mode === 'register'
                ? 'CREATE MY PRIVATE ACCESS'
                : 'SIGN IN TO THE HOUSE'}
            <ArrowRight size={17} />
          </button>

          <p className="privacy-note">
            <LockKeyhole size={13} /> YOUR DETAILS STAY YOURS.
          </p>
        </form>

        <div className="account-form-bottom">
          <span>NOT JUST A SCENT.</span>
          <span>A STATE OF MIND. ✳</span>
        </div>
      </div>
    </main>
  );
}

function BagDrawer({ bag, setBag, user, close, notify }) {
  const total = bag.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan'
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const quantity = (id, delta) => {
    setBag(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const updateShipping = event => {
    setShipping(current => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  async function placeOrder(event) {
    event.preventDefault();
    setCheckoutError('');

    const token = localStorage.getItem('eo_token');

    if (!token) {
      setCheckoutError('Please sign in to place an order.');
      return;
    }

    setPlacing(true);

    try {
      const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

      const response = await fetch(`${api}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: bag.map(item => ({
            productCode: item.productCode || item.id,
            quantity: item.qty
          })),
          shipping,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not place the order.');
      }

      setBag([]);
      setCheckoutOpen(false);
      notify(`Order ${data.order.orderNumber} placed successfully.`);
      close();
    } catch (error) {
      setCheckoutError(
        error.message === 'Failed to fetch'
          ? 'Order service is offline. Start the backend and make sure the database is connected.'
          : error.message
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <motion.div
      className="bag-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      <motion.aside
        className="bag-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bag-heading">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>The scent <em>edit.</em></h2>
          </div>
          <button onClick={close} aria-label="Close bag">
            <X />
          </button>
        </div>

        <div className="bag-lines">
          {bag.length === 0 ? (
            <div className="empty-bag">
              <ShoppingBag size={32} />
              <h3>Room for something lovely.</h3>
              <p>Your bag is waiting for its first signature.</p>
              <button onClick={close}>
                EXPLORE THE SCENT INDEX <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            bag.map(item => (
              <div className="bag-item" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  onError={event => {
                    const image = event.currentTarget;

                    if (!image.dataset.fallback) {
                      image.dataset.fallback = '1';
                      image.src = 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?auto=format&fit=crop&w=1100&q=90';
                    }
                  }}
                />

                <div>
                  <span>{item.family}</span>
                  <h3>{item.name}</h3>
                  <b>{money(item.price)}</b>

                  <div className="quantity">
                    <button
                      onClick={() => quantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => quantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  className="remove-item"
                  onClick={() =>
                    setBag(current => current.filter(p => p.id !== item.id))
                  }
                  aria-label="Remove item"
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {bag.length > 0 && (
          <div className="bag-total">
            <div>
              <span>SUBTOTAL</span>
              <b>{money(total)}</b>
            </div>

            <p>
              {total >= 150
                ? 'Complimentary shipping unlocked.'
                : `Shipping estimate: ${money(8)}. Complimentary shipping over $150.`}
            </p>

            {!checkoutOpen ? (
              <button
                className="form-submit"
                onClick={() => {
                  setCheckoutOpen(true);
                  setCheckoutError('');
                }}
              >
                CONTINUE TO CHECKOUT <ArrowRight size={16} />
              </button>
            ) : !user ? (
              <div className="checkout-signin">
                <p>
                  Sign in to place your order and keep it linked to your account.
                </p>
                <Link
                  to="/account"
                  className="form-submit"
                  onClick={close}
                >
                  SIGN IN / CREATE ACCOUNT <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <form className="checkout-form" onSubmit={placeOrder}>
                <p className="eyebrow">DELIVERY DETAILS</p>

                {[
                  ['fullName', 'FULL NAME', 'text'],
                  ['email', 'EMAIL ADDRESS', 'email'],
                  ['phone', 'PHONE NUMBER', 'tel'],
                  ['address', 'STREET ADDRESS', 'text'],
                  ['city', 'CITY', 'text'],
                  ['postalCode', 'POSTAL CODE (OPTIONAL)', 'text']
                ].map(([name, label, type]) => (
                  <label key={name}>
                    <span>{label}</span>
                    <input
                      name={name}
                      type={type}
                      value={shipping[name]}
                      onChange={updateShipping}
                      required={!['postalCode'].includes(name)}
                      autoComplete={name}
                    />
                  </label>
                ))}

                <label>
                  <span>PAYMENT METHOD</span>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash_on_delivery">Cash on delivery</option>
                    <option value="manual_transfer">Manual bank transfer</option>
                  </select>
                </label>

                {checkoutError && (
                  <p className="form-error">{checkoutError}</p>
                )}

                <button className="form-submit" disabled={placing}>
                  {placing ? 'PLACING YOUR ORDER…' : 'PLACE ORDER'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            <small>
              SECURE DEMO STORE · ONLINE CARD PAYMENTS NOT ENABLED
            </small>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}

export default App;