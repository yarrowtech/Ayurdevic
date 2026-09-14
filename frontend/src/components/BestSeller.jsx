import ProductRail from './ProductRail';
import { useAppContext } from '../context/AppContext';

// "Best Selling" rail: in-stock products the admin has flagged as best sellers.
const BestSeller = () => {
  const { products } = useAppContext();
  const bestSellers = products.filter(product => product.isBestSeller === true && product.inStock);
  return <ProductRail title="Best Selling" products={bestSellers} tone="herbal" />;
};

export default BestSeller;
