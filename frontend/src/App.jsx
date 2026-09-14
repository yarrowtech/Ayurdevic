// import React from 'react'
// import Navbar from './components/Navbar'
// import Hero from './components/Hero'
// import { Route, Routes, useLocation } from 'react-router-dom'
// import Home from './pages/Home'
// import { Toaster } from "react-hot-toast";
// import Footer from './components/Footer'

// const App = () => {

//   const isSellerPath = useLocation().pathname.includes("seller");

//   return (
//     <div>
//       {isSellerPath ? null : <Navbar />}
//       <Toaster position='top-right' />
//       <div className={`${isSellerPath ? "" : "px-4 sm:px-6 lg:px-10 xl:px-16"}`}>
//         <Routes>
//           <Route path='/' element={<Home />} />
//         </Routes>
//       </div>
//       {!isSellerPath && <Footer />}
//     </div>
//   )
// }

// export default App

// src/App.jsx
import React from 'react'
import Navbar from './components/Navbar'
import CategoryStrip from './components/CategoryStrip'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import PromoPopup from './components/PromoPopup';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Account from './pages/Account';
import Contact from './pages/Contact';
import DeliveryInformation from './pages/DeliveryInformation';
import Returns from './pages/Returns';
import PaymentMethods from './pages/PaymentMethods';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';

const App = () => {
  const { pathname } = useLocation();
  const isSellerPath = pathname.includes("seller");
  const isAdminPath = /^\/admin(?:\/|$)/.test(pathname);
  const isAccountPath = /^\/account(?:\/|$)/i.test(pathname);
  const isProductPath = /^\/products(?:\/|$)/i.test(pathname);
  const { showUserLogin } = useAppContext();
 
  return (
    <div className="font-body bg-paper text-ink min-h-screen flex flex-col">
      {!isSellerPath && !isAdminPath && (
        <header className="sticky top-0 z-50">
          <Navbar />
          {!isAccountPath && !isProductPath && <CategoryStrip />}
        </header>
      )}
      {showUserLogin ? <Login /> : null}
      {!isSellerPath && !isAdminPath && <PromoPopup />}
      <Toaster position="bottom-center" containerStyle={{ bottom: "max(16px, env(safe-area-inset-bottom))" }} />
      
      <main className={`${isSellerPath || isAdminPath ? "" : "px-4 sm:px-6 lg:px-10 xl:px-16"} min-w-0 flex-grow`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/account' element={<Account />} />
          <Route path='/admin/*' element={<Admin />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/delivery-information' element={<DeliveryInformation />} />
          <Route path='/returns' element={<Returns />} />
          <Route path='/payment-methods' element={<PaymentMethods />} />
          <Route path='/faq' element={<Faq />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  )
}

export default App
