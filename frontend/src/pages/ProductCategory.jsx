import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { ProductCardSkeleton } from '../components/Skeleton';


const ProductCategory = () => {
  const { products, productsLoading, categories } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find(
    (item) => item.key === category.toLowerCase()
  );

  const filteredProducts = products.filter(
    (product) =>
      product.category &&
      product.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="mt-16">

      {searchCategory && (
        <div className="flex flex-col items-start max-w-full">
          <p className="text-2xl font-medium break-words max-w-full">
            {searchCategory.name.toUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-black rounded-full"></div>
          {searchCategory.offer && <p className="mt-3 rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">{searchCategory.offer}</p>}
        </div>
      )}

      {productsLoading && !products.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-6">
          {Array.from({ length: 10 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-6">
        {filteredProducts.map((product, index) => (
          <Reveal key={product._id} delay={(index % 10) * 40}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
      ) : (
        <div className='flex items-center justify-center h-[60vh]'>
            <p className='text-2xl font-medium break-words max-w-full text-black'>No products found in this category</p>
        </div>
      )}
      {/* Show filtered products */}

    </div>
  );
};

export default ProductCategory
