import { getProductPrice } from "../services/productPrice";
import ProductRail from './ProductRail';
import { useAppContext } from '../context/AppContext';

// "Trending Deals" rail: the most-discounted in-stock products.
export default function TrendingDeals() {
  const { products } = useAppContext();
  const discount = p => (p.price > 0 ? (p.price - getProductPrice(p)) / p.price : 0);
  const deals = products.filter(p => p.inStock).sort((a, b) => discount(b) - discount(a)).slice(0, 12);
  return <ProductRail title="Trending Deals" products={deals} tone="herbal" />;
}
