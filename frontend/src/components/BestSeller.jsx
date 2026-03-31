import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();
  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium text-center">Best Sellers</p>
      <div
        className="
          mt-6 grid 
          grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
          gap-4 md:gap-6 lg:gap-8
        "
      >
        {products
          .filter((product) => product.inStock)
          .slice(0, 5)
          .map((product, index) => (
            <div key={index} className="flex">
              <ProductCard product={product} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default BestSeller;
