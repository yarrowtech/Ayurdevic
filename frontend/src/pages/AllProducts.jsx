import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { ProductCardSkeleton } from '../components/Skeleton';


const AllProducts = () => {

    const { products, productsLoading, searchQuery } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (searchQuery && searchQuery.length > 0) {
            setFilteredProducts(
                products.filter(
                    (product) =>
                        product.name &&
                        product.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProducts(products);
        }
    }, [products, searchQuery]);


    return (
        <div className='mt-16 flex flex-col'>

            <div className='flex flex-col items-end w-max'>
                <p className='text-2xl font-medium uppercase'>All Products</p>
                <div className='w-16 h-0.5 bg-herbal rounded-full'></div>
            </div>

            {productsLoading && !products.length ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-6'>
                    {Array.from({ length: 10 }, (_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-6'>
                    {filteredProducts.filter((product) => product.inStock).map((product, index) => (
                        <Reveal key={product._id} delay={(index % 10) * 40}>
                            <ProductCard product={product} />
                        </Reveal>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AllProducts
