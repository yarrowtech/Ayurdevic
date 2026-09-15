// src/pages/Home.jsx
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BannerCarousel from '../components/BannerCarousel'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  const { hash } = useLocation();
  // Footer links like "/#best-selling" land here; scroll to the section once it's rendered.
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);
  return (
    <div className="bg-paper text-ink">
      <BannerCarousel />
      <NewsLetter />
    </div>
  )
}

export default Home
