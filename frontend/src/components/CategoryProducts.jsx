import ProductRail from './ProductRail';
import { useAppContext } from '../context/AppContext';

// One "Trending Deals"-style rail per category, so every category's
// products get a row on the homepage, not just deals/best sellers.
export default function CategoryProducts() {
  const { products, categories } = useAppContext();
  const inStock = products.filter(p => p.inStock);

  return (
    <>
      {categories.map((category, index) => {
        const items = inStock.filter(p => p.category && p.category.toLowerCase() === category.key.toLowerCase());
        return (
          <ProductRail
            key={category._id || category.key}
            title={category.name}
            products={items}
            viewAllTo={`/products/${encodeURIComponent(category.key)}`}
            tone={index % 2 === 0 ? 'herbal' : 'clay'}
          />
        );
      })}
    </>
  );
}
