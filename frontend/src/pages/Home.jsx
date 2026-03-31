// import React from 'react'
// import MainBanner from '../components/MainBanner'
// import Categories from '../components/Categories'
// import BestSeller from '../components/BestSeller'
// import BottomBanner from '../components/BottomBanner'
// import NewsLetter from '../components/NewsLetter'
// import Footer from '../components/Footer'

// const Home = () => {
//   return (
//     <div className='mt-10'>
//       <MainBanner />
//       <Categories />
//       <BestSeller />
//       <BottomBanner />
//       <NewsLetter />
//       {/* <Footer /> */}
//     </div>
//   )
// }

// export default Home

// src/pages/Home.jsx
import React from 'react'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <div className="bg-paper text-ink">
      <Hero />
      <Categories />
      <BestSeller />
      <NewsLetter />
      {/* <Footer /> */}
    </div>
  )
}

export default Home
