import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets";

const Cart = () => {
    const { products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate } = useAppContext();
    const [showAddress, setShowAddress] = useState(false);
    const cartArray = Object.entries(cartItems).flatMap(([id, quantity]) => {
        const product = products.find(item => item._id === id);
        return product ? [{ ...product, quantity }] : [];
    });

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col lg:flex-row gap-8 mt-8 sm:mt-16">
            <div className='flex-1 min-w-0'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm">{getCartCount()} Items</span>
                </h1>

                <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_6rem_4rem] gap-3 text-gray-500 text-sm font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_6rem_4rem] gap-3 text-gray-500 items-center text-sm font-medium py-4 border-b border-gray-300/60">
                        <div className="col-span-2 sm:col-span-1 min-w-0 flex items-center gap-3">
                            <div onClick={()=>{navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0)}} className="cursor-pointer shrink-0 w-20 h-20 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                <img className="w-full h-full object-contain" src={product.image[0]} alt={product.name} />
                            </div>
                            <div className="min-w-0">
                                <p className="break-words font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select
                                            className='min-h-11 min-w-14 rounded px-2 outline-none'
                                            aria-label={`Quantity for ${product.name}`}
                                            value={cartItems[product._id]}
                                            onChange={(event) => updateCartItem(product._id, Number(event.target.value))}
                                        >
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="break-words sm:text-center"><span className="sm:hidden">Subtotal: </span>{currency} {product.offerPrice * product.quantity}</p>
                        <button aria-label={`Remove ${product.name}`} onClick={()=> removeFromCart(product._id)} className="cursor-pointer min-h-11 min-w-11 mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={()=> {navigate("/products"); scrollTo(0, 0);}} className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium">
                    <img src={assets.arrow_right_icon_colored} alt="arrow" className="group-hover:-translate-x-1 transition" />
                    Continue Shopping
                </button>

            </div>

            <div className="lg:max-w-[320px] xl:max-w-[360px] w-full shrink-0 self-start bg-gray-100/40 p-5 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">No address found</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-indigo-500 hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                <p onClick={() => setShowAddress(false)} className="text-gray-500 p-2 hover:bg-gray-100">
                                    New York, USA
                                </p>
                                <p onClick={() => setShowAddress(false)} className="text-indigo-500 text-center cursor-pointer p-2 hover:bg-indigo-500/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>$20</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>$20</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>$20</span>
                    </p>
                </div>

                <button className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition">
                    Place Order
                </button>
            </div>
        </div>
    ) : null
}

export default Cart
