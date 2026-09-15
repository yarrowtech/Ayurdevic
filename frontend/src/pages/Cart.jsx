import { getProductPrice, getIncludedTax } from "../services/productPrice";
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import { assets } from "../assets/assets";
import { getAddresses } from "../services/addressService";
import { placeOrder } from "../services/orderService";

const Cart = () => {
    const { products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, clearCart, navigate, user, setShowUserLogin } = useAppContext();
    const [addresses, setAddresses] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [showAddressPicker, setShowAddressPicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [placing, setPlacing] = useState(false);

    const cartArray = Object.entries(cartItems).flatMap(([id, quantity]) => {
        const product = products.find(item => item._id === id);
        return product ? [{ ...product, quantity }] : [];
    });

    useEffect(() => {
        if (!user) { setAddresses(null); return; }
        getAddresses().then(data => {
            setAddresses(data.addresses);
            setSelectedAddressId(current => current || data.addresses.find(a => a.isDefault)?._id || data.addresses[0]?._id || "");
        }).catch(() => toast.error("Unable to load your addresses."));
    }, [user]);

    const subtotal = Math.round(cartArray.reduce((sum, item) => sum + getProductPrice(item, item.quantity) * item.quantity, 0) * 100) / 100;
    const itemCount = cartArray.reduce((sum, item) => sum + item.quantity, 0);
    const savings = cartArray.reduce((sum, item) => sum + Math.max(0, item.price - getProductPrice(item, item.quantity)) * item.quantity, 0);
    const bulkSavings = cartArray.reduce((sum, item) => sum + (getProductPrice(item) - getProductPrice(item, item.quantity)) * item.quantity, 0);
    const money = value => `${currency}${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const taxBreakdown = Object.entries(cartArray.reduce((groups, item) => {
        const rate = item.taxRate ?? 0;
        groups[rate] = (groups[rate] || 0) + getIncludedTax(getProductPrice(item, item.quantity), item.quantity, rate);
        return groups;
    }, {})).sort(([a], [b]) => Number(a) - Number(b));
    const shippingFee = 0;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;
    const selectedAddress = addresses?.find(a => a._id === selectedAddressId);

    const placeOrderNow = async () => {
        if (placing) return;
        if (!user) return setShowUserLogin(true);
        if (!selectedAddressId) return toast.error("Choose a delivery address.");
        if (!cartArray.length) return;
        setPlacing(true);
        try {
            await placeOrder({ items: cartArray.map(item => ({ productId: item._id, quantity: item.quantity })), addressId: selectedAddressId, paymentMethod });
            clearCart();
            toast.success("Order placed!");
            navigate("/account?tab=orders");
        } catch (err) { toast.error(err.response?.data?.message || "Unable to place your order. Please try again."); }
        finally { setPlacing(false); }
    };

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col lg:flex-row gap-8 mt-8 sm:mt-16">
            <div className='flex-1 min-w-0'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm">{getCartCount()} Items</span>
                </h1>

                <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_6rem_4rem] gap-3 text-stone-500 text-sm font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_6rem_4rem] gap-3 text-stone-500 items-center text-sm font-medium py-4 border-b border-stone-200">
                        <div className="col-span-2 sm:col-span-1 min-w-0 flex items-center gap-3">
                            <div onClick={()=>{navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0)}} className="cursor-pointer shrink-0 w-20 h-20 flex items-center justify-center border border-stone-200 rounded overflow-hidden">
                                <img className="w-full h-full object-contain" src={product.image[0]} alt={product.name} />
                            </div>
                            <div className="min-w-0">
                                <p className="break-words font-semibold text-[var(--ink)]">{product.name}</p>
                                <div className="font-normal text-stone-500">
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
                        <div className="break-words sm:text-center"><p><span className="sm:hidden">Subtotal: </span>{currency}{(getProductPrice(product, product.quantity) * product.quantity).toFixed(2)}</p>{product.extraDiscountPercent > 0 && <p className="mt-1 text-xs text-green-800">Extra {product.extraDiscountPercent}% off applied</p>}{product.bulkDiscountPercent > 0 && <p className="mt-1 text-xs text-green-800">{product.quantity >= product.bulkMinQuantity ? `Bulk ${product.bulkDiscountPercent}% off applied` : `Buy ${product.bulkMinQuantity}+ for an extra ${product.bulkDiscountPercent}% off`}</p>}</div>
                        <button aria-label={`Remove ${product.name}`} onClick={()=> removeFromCart(product._id)} className="cursor-pointer min-h-11 min-w-11 mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={()=> {navigate("/products"); scrollTo(0, 0);}} className="group cursor-pointer flex items-center mt-8 gap-2 text-green-800 font-medium">
                    <img src={assets.arrow_right_icon_colored} alt="arrow" className="group-hover:-translate-x-1 transition" />
                    Continue Shopping
                </button>

            </div>

            <div className="lg:max-w-[360px] xl:max-w-[400px] w-full shrink-0 self-start rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">Order summary</h2>
                    <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                </div>
                <hr className="border-stone-200 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative mt-2">
                        {!user ? (
                            <button onClick={() => setShowUserLogin(true)} className="text-green-800 hover:underline cursor-pointer">Sign in to add an address</button>
                        ) : addresses === null ? (
                            <p className="text-stone-500">Loading addresses…</p>
                        ) : selectedAddress ? (
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 break-words text-sm leading-6 text-stone-600">
                                    {selectedAddress.label && <p className="font-semibold text-stone-900">{selectedAddress.label}</p>}
                                    <p>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}</p>
                                    <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                                    <p>{selectedAddress.country}</p>
                                    <p className="mt-1">{selectedAddress.phone}</p>
                                </div>
                                <button onClick={() => setShowAddressPicker(current => !current)} className="shrink-0 text-green-800 hover:underline cursor-pointer">Change</button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start gap-2">
                                <p className="text-stone-500">No address found</p>
                                <Link to="/account?tab=addresses" className="shrink-0 text-green-800 hover:underline">Add address</Link>
                            </div>
                        )}
                        {user && showAddressPicker && addresses && (
                            <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white py-1 text-sm shadow-lg">
                                {addresses.map(address => (
                                    <button key={address._id} onClick={() => { setSelectedAddressId(address._id); setShowAddressPicker(false); }} className="block min-h-11 w-full px-3 py-2 text-left text-stone-600 hover:bg-stone-50">
                                        {address.label ? `${address.label} — ` : ""}{address.line1}, {address.city}
                                    </button>
                                ))}
                                <Link to="/account?tab=addresses" onClick={() => setShowAddressPicker(false)} className="block min-h-11 px-3 py-2 text-center text-green-800 hover:bg-green-50">+ Add new address</Link>
                            </div>
                        )}
                    </div>

                    <label htmlFor="checkout-payment" className="block text-sm font-medium uppercase mt-6">Payment Method</label>

                    <select id="checkout-payment" disabled={placing} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-stone-300 bg-white px-3 py-3 mt-2 rounded-lg focus:outline-2 focus:outline-green-800">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-stone-200" />

                <div className="text-stone-600 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span><span className="tabular-nums">{money(subtotal)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-700">{shippingFee ? `${currency}${shippingFee.toFixed(2)}` : "Free"}</span>
                    </p>
                    {taxBreakdown.map(([rate, amount]) => (
                        <p key={rate} className="flex justify-between gap-3">
                            <span>Included tax ({rate}%)</span><span className="tabular-nums">{money(amount)}</span>
                        </p>
                    ))}
                    <p className="flex justify-between border-t border-stone-200 pt-4 text-xl font-semibold mt-4 text-[var(--ink)]">
                        <span>Total</span><span className="tabular-nums">{money(total)}</span>
                    </p>
                    {savings > 0 && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">You save {money(savings)} on your products</p>}
                    {bulkSavings > 0 && <p className="text-sm text-green-800">Includes {money(bulkSavings)} in bulk savings</p>}
                </div>

                <button disabled={placing || !cartArray.length} onClick={placeOrderNow} className="w-full py-3 mt-6 cursor-pointer bg-green-800 text-white font-medium hover:bg-green-900 disabled:opacity-50 rounded-lg">
                    {placing ? "Placing order…" : "Place Order"}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart
