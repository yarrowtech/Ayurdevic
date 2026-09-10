import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { checkAuth, logoutUser } from "../services/userService";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const refreshCategories = useCallback(async () => {
        try { setCategories((await api.get('/api/categories')).data.categories); }
        catch { toast.error('Unable to load categories.'); }
    }, []);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all products
    const refreshProducts = useCallback(async () => {
        try {
            const { data } = await api.get('/api/products');
            setProducts(data.products);
            setCartItems(current => Object.fromEntries(
                Object.entries(current).filter(([id]) => data.products.some(product => product._id === id))
            ));
        } catch {
            toast.error('Unable to load products. Check the backend connection.');
        }
    }, []);

    // Check if user is already logged in
    const fetchUser = async () => {
        try {
            const data = await checkAuth();
            if (data.success) {
                setUser(data.user);
            }
        } catch {
            setUser(null);
        }
    }

    // Log the user out
    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
            toast.success("Logged out");
            navigate("/");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    // Add product to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to Cart");
    }

    // Update cart item quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("cart Updated");
    }

    // Remove product from cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        toast.success("Removed from Cart");
        setCartItems(cartData);
    }

    // Get cart item count
    const getCartCount = ()=> {
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // get cart total ammount
    const getCartAmount = ()=>{
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product) => product._id === items);
            if(itemInfo && cartItems[items] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchUser();
        refreshProducts();
        refreshCategories();
    }, [refreshProducts, refreshCategories]);

    const value = { navigate, user, setUser, logout, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, refreshProducts };
    return <AppContext.Provider value={{ ...value, categories, refreshCategories }}>
        {children}
    </AppContext.Provider>;
}

export const useAppContext = () => {
    return useContext(AppContext);
}
