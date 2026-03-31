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
//       <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
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
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin } = useAppContext();
 
  return (
    <div className="font-body bg-paper text-ink min-h-screen flex flex-col">
      {!isSellerPath && <Navbar />}
      {showUserLogin ? <Login /> : null}
      <Toaster position="top-right" />
      
      <main className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} flex-grow`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
