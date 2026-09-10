import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate} = useAppContext();



    return product && (
        <div onClick={() => {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0);}} className="border border-gray-500/20 rounded-md p-3 sm:p-4 bg-white min-w-0 w-full flex flex-col">
            <div className="group cursor-pointer flex aspect-square w-full items-center justify-center overflow-hidden p-3">
                <img className="h-full w-full object-contain group-hover:scale-105 transition-transform" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm min-w-0 flex flex-1 flex-col">
                <p className="truncate">{product.category}</p>
                <p className="text-gray-700 font-medium text-sm sm:text-base leading-5 line-clamp-2 min-h-10 w-full" title={product.name}>{product.name}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                        <img key={i} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="review" className="md:w-3.5 w-3" />
                    ))}
                    <p>4</p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-2 pt-3 mt-auto">
                    <p className="flex flex-wrap items-baseline gap-x-1 break-all md:text-xl text-base font-medium text-primary">
                        {currency} {product.offerPrice}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency} {product.price}</span>
                    </p>
                    <div onClick={(e) => {e.stopPropagation();}} className="text-primary">
                        {!cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 min-w-20 min-h-11 px-2 rounded cursor-pointer" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center bg-primary/25 rounded select-none">
                                <button aria-label={`Decrease ${product.name} quantity`} onClick={() => {removeFromCart(product._id)}} className="cursor-pointer w-9 min-h-11 border border-[var(--herbal)] text-[var(--herbal)] rounded" >
                                    -
                                </button>
                                <span className="min-w-5 px-1 text-center">{cartItems[product._id]}</span>
                                <button aria-label={`Increase ${product.name} quantity`} onClick={() => {addToCart(product._id)}} className="cursor-pointer w-9 min-h-11 border border-[var(--herbal)] text-[var(--herbal)] rounded" >
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
