// src/pages/Home.jsx
import React from 'react'
import BannerCarousel from '../components/BannerCarousel'
import Categories from '../components/Categories'
import TrendingDeals from '../components/TrendingDeals'
import BestSeller from '../components/BestSeller'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <div className="bg-paper text-ink">
      <BannerCarousel />
      <Categories />
      <TrendingDeals />
      <BestSeller />
      <NewsLetter />
    </div>
  )
}

export default Home
