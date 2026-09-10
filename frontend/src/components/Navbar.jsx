import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, logout } = useAppContext();

  useEffect(()=> {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery, navigate]);

  // Helper: link classes + active dot
  const linkClass = (isActive) =>
    `relative pb-3 text-[var(--ink)]/90 hover:text-[var(--herbal-dark)] transition-colors
     ${isActive ? 'text-[var(--herbal-dark)]' : ''}`;

  const Dot = () => (
    <span className="absolute left-1/2 -bottom-0 -translate-x-1/2 w-1/2 h-1.5 rounded-full bg-[var(--herbal)]"></span>
  );

  return (
    <nav
      className="
        sticky top-0 z-50
        flex items-center justify-between
        px-4 sm:px-6 lg:px-10 xl:px-16 py-3 gap-4
        bg-[var(--paper)]/80 backdrop-blur
        border-b border-[var(--clay)]/70
        shadow-sm
        text-[var(--ink)]
        transition-all
      "
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
        <NavLink to="/">
          {({ isActive }) => (
            <span className={linkClass(isActive)}>
              Home
              {isActive && <Dot />}
            </span>
          )}
        </NavLink>

        <NavLink to="/products">
          {({ isActive }) => (
            <span className={linkClass(isActive)}>
              All Products
              {isActive && <Dot />}
            </span>
          )}
        </NavLink>

        <NavLink to="/contact">
          {({ isActive }) => (
            <span className={linkClass(isActive)}>
              Contact
              {isActive && <Dot />}
            </span>
          )}
        </NavLink>

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
        <div onClick={() => navigate('/cart')} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80 hover:opacity-100 transition' />
          <button
            className="
              absolute -top-2 -right-3 text-xs bg-[var(--herbal)] text-white
              w-[18px] h-[18px] rounded-full grid place-items-center shadow
            "
          >
            {getCartCount()}
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
          <div className='relative group'>
            <button type="button" aria-label="Account menu" className="p-1"><img src={assets.profile_icon} className="w-10" alt="" /></button>
            <ul
              className="
                hidden group-hover:block group-focus-within:block absolute top-10 right-0
                bg-white/90 backdrop-blur
                shadow-lg border border-[var(--clay)]/70
                py-2.5 w-30 rounded-md text-sm z-40
              "
            >
              <li
                onClick={() => navigate('/my-orders')}
                className='p-1.5 pl-3 hover:bg-[var(--herbal)]/10 cursor-pointer text-[var(--ink)]'
              >
                My Orders
              </li>
              <li
                onClick={logout}
                className='p-1.5 pl-3 hover:bg-[var(--herbal)]/10 cursor-pointer text-[var(--ink)]'
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile: cart + menu */}
      <div className='flex items-center gap-5 xl:hidden'>
        <div onClick={() => navigate('/cart')} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80 hover:opacity-100 transition' />
          <button
            className="
              absolute -top-2 -right-3 text-xs bg-[var(--herbal)] text-white
              w-[18px] h-[18px] rounded-full grid place-items-center shadow
            "
          >
            {getCartCount()}
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

          <NavLink to="/products" onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <span className={`${linkClass(isActive)} block w-full py-2`}>
                All Products
                {isActive && <Dot />}
              </span>
            )}
          </NavLink>

          {user && (
            <NavLink to="/my-orders" onClick={() => setOpen(false)}>
              {({ isActive }) => (
                <span className={`${linkClass(isActive)} block w-full py-2`}>
                  My Orders
                  {isActive && <Dot />}
                </span>
              )}
            </NavLink>
          )}

          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin panel</NavLink>}

          <NavLink to="/contact" onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <span className={`${linkClass(isActive)} block w-full py-2`}>
                Contact
                {isActive && <Dot />}
              </span>
            )}
          </NavLink>

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
              onClick={logout}
              className="
                cursor-pointer px-6 py-2 mt-2 rounded-full text-sm
                bg-primary text-white hover:bg-[var(--herbal-dark)] transition
                shadow-sm
              "
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
