import { getProductPrice } from "../services/productPrice";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate} = useAppContext();
    const discount = product?.price > 0 && getProductPrice(product) >= 0 && getProductPrice(product) < product.price
        ? Math.round((product.price - getProductPrice(product)) / product.price * 100)
        : 0;

    return product && (
        <div onClick={() => {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0);}} className="border border-gray-500/20 rounded-md p-3 sm:p-4 bg-white min-w-0 w-full flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
            <div className="group cursor-pointer relative flex aspect-square w-full items-center justify-center overflow-hidden p-3">
                {product.isBestSeller && (
                    <span className="absolute left-1 top-1 z-10 -rotate-12 select-none rounded-full border-2 border-amber-500 bg-amber-50/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-sm">
                        Best Seller
                    </span>
                )}
                <img className="h-full w-full object-contain group-hover:scale-105 transition-transform" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm min-w-0 flex flex-1 flex-col">
                <p className="truncate">{product.category}</p>
                {product.extraDiscountPercent > 0 && <p className="my-1 text-xs font-semibold text-green-800">Extra {product.extraDiscountPercent}% off sale price</p>}
                <p className="text-gray-700 font-medium text-sm sm:text-base leading-5 line-clamp-2 min-h-10 w-full" title={product.name}>{product.name}</p>
                <div className="flex flex-wrap items-end justify-between gap-3 pt-3 mt-auto">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span aria-label="Selling price" className="whitespace-nowrap text-xl sm:text-2xl font-bold leading-tight text-green-900">{currency} {Number(getProductPrice(product)).toLocaleString('en-IN')}</span>
                        {product.price > getProductPrice(product) && <span aria-label="Original price" className="whitespace-nowrap text-xs sm:text-sm text-stone-500 line-through">{currency} {Number(product.price).toLocaleString('en-IN')}</span>}
                        {discount > 0 && <span className="whitespace-nowrap rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{discount}% OFF</span>}
                    </div>
                    <div onClick={(e) => {e.stopPropagation();}} className="text-green-800">
                        {!cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-green-50 border border-green-700 min-w-20 min-h-11 px-2 rounded cursor-pointer transition-transform active:scale-90" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center bg-green-50 rounded select-none">
                                <button aria-label={`Decrease ${product.name} quantity`} onClick={() => {removeFromCart(product._id)}} className="cursor-pointer w-9 min-h-11 border border-[var(--herbal)] text-[var(--herbal)] rounded transition-transform active:scale-90" >
                                    -
                                </button>
                                <span className="min-w-5 px-1 text-center">{cartItems[product._id]}</span>
                                <button aria-label={`Increase ${product.name} quantity`} onClick={() => {addToCart(product._id)}} className="cursor-pointer w-9 min-h-11 border border-[var(--herbal)] text-[var(--herbal)] rounded transition-transform active:scale-90" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
