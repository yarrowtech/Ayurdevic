import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import ContactModal from './ContactModal';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const { user, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, logout } = useAppContext();
  const cartCount = getCartCount();
  const previousCartCount = useRef(cartCount);

  useEffect(()=> {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery, navigate]);

  // Give the header a bit more depth once the page has scrolled past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bump the cart icon whenever an item is added.
  useEffect(() => {
    if (cartCount > previousCartCount.current) {
      setCartBump(true);
      const timer = setTimeout(() => setCartBump(false), 400);
      previousCartCount.current = cartCount;
      return () => clearTimeout(timer);
    }
    previousCartCount.current = cartCount;
  }, [cartCount]);

  // Helper: link classes + active dot
  const linkClass = (isActive) =>
    `relative pb-3 text-[var(--ink)]/90 hover:text-[var(--herbal-dark)] transition-colors
     ${isActive ? 'text-[var(--herbal-dark)]' : ''}`;

  const Dot = () => (
    <span className="absolute left-1/2 -bottom-0 -translate-x-1/2 w-1/2 h-1.5 rounded-full bg-[var(--herbal)]"></span>
  );

  return (
    <nav
      className={`
        relative z-50
        flex items-center justify-between
        px-4 sm:px-6 lg:px-10 xl:px-16 py-3 gap-4
        bg-[var(--paper)]/80 backdrop-blur
        border-b border-[var(--clay)]/70
        text-[var(--ink)]
        transition-shadow duration-300
        ${scrolled ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      <NavLink to='/' onClick={() => setOpen(false)} className="select-none">
        <span className="
          text-2xl font-bold tracking-tight
          text-[var(--ink)]
          hover:text-[var(--herbal-dark)] transition-colors
        ">
          Ayurvedic
        </span>
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden xl:flex items-center gap-5">
        <NavLink to="/" className={({ isActive }) => `${linkClass(isActive)} inline-flex min-h-11 items-center pt-3 leading-6`}>
          {({ isActive }) => (
            <>
              Home
              {isActive && <Dot />}
            </>
          )}
        </NavLink>

        <button type="button" aria-haspopup="dialog" onClick={() => setContactOpen(true)} className={`${linkClass(contactOpen)} inline-flex min-h-11 items-center pt-3 leading-6`}>
          Contact
          {contactOpen && <Dot />}
        </button>

        {/* Search */}
        <div
          className="
            hidden lg:flex items-center text-sm gap-2
            border border-[var(--clay)]/80
            bg-white/70 backdrop-blur
            px-3 py-1.5 rounded-full
            focus-within:ring-2 focus-within:ring-[var(--herbal)]/40
            transition
          "
        >
          <input
            value={searchQuery ?? ""} aria-label="Search products" onChange={(e)=> setSearchQuery(e.target.value)}
            className="
              py-0.5 w-full bg-transparent outline-none
              placeholder-[var(--ink)]/50 text-[var(--ink)]
            "
            type="text"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="search" className='w-4 h-4 opacity-70' />
        </div>

        {/* Cart */}
        <div onClick={() => navigate('/cart')} className={`relative cursor-pointer ${cartBump ? 'animate-cart-bump' : ''}`}>
          <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80 hover:opacity-100 transition' />
          <button
            className="
              absolute -top-2 -right-3 text-xs bg-[var(--herbal)] text-white
              w-[18px] h-[18px] rounded-full grid place-items-center shadow
            "
          >
            {cartCount}
          </button>
        </div>

        {/* Auth */}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className="
              cursor-pointer px-8 py-2 rounded-full
              bg-[var(--herbal)] text-white
              hover:bg-[var(--herbal-dark)] transition
              shadow-sm
            "
          >
            Login
          </button>
        ) : (
          <NavLink to="/account" aria-label="My account" className="p-1"><img src={assets.profile_icon} className="w-10" alt="" /></NavLink>
        )}
      </div>

      {/* Mobile: cart + menu */}
      <div className='flex items-center gap-5 xl:hidden'>
        <div onClick={() => navigate('/cart')} className={`relative cursor-pointer ${cartBump ? 'animate-cart-bump' : ''}`}>
          <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80 hover:opacity-100 transition' />
          <button
            className="
              absolute -top-2 -right-3 text-xs bg-[var(--herbal)] text-white
              w-[18px] h-[18px] rounded-full grid place-items-center shadow
            "
          >
            {cartCount}
          </button>
        </div>

        <button
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          aria-label="Menu" aria-expanded={open} aria-controls="mobile-navigation"
          className="
            xl:hidden p-3 rounded-md
            hover:bg-white/70 active:scale-95 transition
            border border-[var(--clay)]/60
          "
        >
          <img src={assets.menu_icon} alt="menu" className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          id="mobile-navigation"
          className={`
            ${open ? 'flex' : 'hidden'}
            absolute top-full left-0 w-full max-h-[calc(100dvh-70px)] overflow-y-auto
            bg-[var(--paper)]/95 backdrop-blur
            shadow-md border-t border-[var(--clay)]/70
            py-4 flex-col items-start gap-2 px-5 text-base xl:hidden
          `}
        >
          <label className="w-full">
            <span className="sr-only">Search products</span>
            <input type="search" value={searchQuery ?? ""} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products" className="mb-2 min-h-11 w-full rounded-lg border border-[var(--clay)] bg-white px-3" />
          </label>
          <NavLink to="/" onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <span className={`${linkClass(isActive)} block w-full py-2`}>
                Home
                {isActive && <Dot />}
              </span>
            )}
          </NavLink>

          {user && <>
            <div className="max-w-full py-2"><p className="break-words font-medium">{user.name}</p><p className="break-all text-sm text-stone-500">{user.email}</p></div>
            <NavLink to="/account" onClick={() => setOpen(false)} className="block w-full py-2">My account</NavLink>
            <NavLink to="/account?tab=orders" onClick={() => setOpen(false)} className="block w-full py-2">Orders</NavLink>
            <NavLink to="/account?tab=addresses" onClick={() => setOpen(false)} className="block w-full py-2">Addresses</NavLink>
            <NavLink to="/account?tab=support" onClick={() => setOpen(false)} className="block w-full py-2">Customer support</NavLink>
          </>}

          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin panel</NavLink>}

          <button type="button" aria-haspopup="dialog" onClick={() => { setOpen(false); setContactOpen(true); }} className={`${linkClass(false)} block min-h-11 w-full py-2 text-left`}>Contact</button>

          {!user ? (
            <button
              onClick={() => { setOpen(false); setShowUserLogin(true); }}
              className="
                cursor-pointer px-6 py-2 mt-2 rounded-full text-sm
                bg-black text-white
                hover:bg-[var(--herbal-dark)] transition
                shadow-sm
              "
            >
              Login
            </button>
          ) : (
            <button
              onClick={async () => { await logout(); setOpen(false); }}
              className="
                cursor-pointer px-6 py-2 mt-2 rounded-full text-sm
                bg-green-800 text-white hover:bg-[var(--herbal-dark)] transition
                shadow-sm
              "
            >
              Sign out
            </button>
          )}
        </div>
      )}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </nav>
  )
}

export default Navbar
