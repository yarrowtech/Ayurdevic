import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { Toaster } from "react-hot-toast";

const ProductDetails = () => {
    const { products, navigate, currency, addToCart } = useAppContext();
    const { id } = useParams();

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => product.category === item.category);
            setRelatedProducts(productsCopy.slice(0, 5));
        }
    }, [products]);

    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null);
    }, [product]);

    return (
        product && (
            <div className="mt-12">
                <Toaster position="top-right" />
                {/* Breadcrumbs */}
                {/* <p className="text-sm text-[var(--ink)]/80">
          <Link to={"/"} className="hover:text-[var(--herbal-dark)] transition-colors">Home</Link> /
          <Link to={"/products"} className="hover:text-[var(--herbal-dark)] transition-colors"> Products</Link> /
          <Link
            to={`/products/${product.category.toLowerCase()}`}
            className="hover:text-[var(--herbal-dark)] transition-colors"
          >
            {" "}
            {product.category}
          </Link>{" "}
          / <span className="text-[var(--herbal)]">{product.name}</span>
        </p> */}

                <div class="flex flex-wrap items-center space-x-2 text-sm text-[var(--ink)]/80 font-medium">
                    <Link to={"/"} type="button" aria-label="Home" >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z" fill="#475569" stroke="#475569" stroke-width=".094" />
                        </svg>
                    </Link>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="black" />
                    </svg>
                    <Link to={"/products"}>Products</Link>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="black" />
                    </svg>
                    <Link to={`/products/${product.category.toLowerCase()}`}>{product.category}</Link>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="black" />
                    </svg>
                    <span class="text-[var(--herbal)]">{product.name}</span>
                </div>

                {/* Main grid */}
                <div className="flex flex-col md:flex-row gap-10 md:gap-16 mt-5">
                    {/* Left: Gallery */}
                    <div className="flex gap-4 md:gap-6">
                        {/* Thumbs */}
                        <div className="flex md:flex-col gap-3 md:gap-4">
                            {product.image.map((image, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setThumbnail(image)}
                                    className={`
                    bg-white overflow-hidden rounded-xl cursor-pointer
                    border transition-all
                    ${thumbnail === image
                                            ? "border-[var(--herbal)] ring-2 ring-[var(--herbal)]/30"
                                            : "border-[var(--clay)]/70 hover:border-[var(--herbal)]/60"}
                    w-20 h-20 md:w-24 md:h-24
                  `}
                                    aria-label={`Select image ${index + 1}`}
                                >
                                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Selected */}
                        <div
                            className="
                bg-white rounded-2xl overflow-hidden
                border border-[var(--clay)]/70
                w-[18rem] h-[18rem] sm:w-[22rem] sm:h-[22rem] md:w-[28rem] md:h-[28rem]
                shadow-sm
              "
                        >
                            <img src={thumbnail} alt="Selected product" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="text-sm w-full md:w-1/2">
                        <h1 className="text-3xl md:text-4xl font-heading text-[var(--ink)]">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-0.5 mt-2">
                            {Array(5)
                                .fill("")
                                .map((_, i) => (
                                    <img
                                        key={i}
                                        src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                                        alt="review"
                                        className="md:w-4 w-3.5"
                                    />
                                ))}
                            <p className="text-base ml-2 text-[var(--ink)]/80">(4)</p>
                        </div>

                        {/* Price */}
                        <div className="mt-6">
                            <p className="text-[var(--ink)]/60 line-through">
                                MRP: {currency} {product.price}
                            </p>
                            <p className="text-2xl md:text-3xl font-semibold text-[var(--ink)]">
                                MRP: {currency}
                                {product.offerPrice}
                            </p>
                            <span className="text-[var(--ink)]/60">(inclusive of all taxes)</span>
                        </div>

                        {/* About */}
                        <p className="text-base font-medium mt-6 text-[var(--ink)]">About Product</p>
                        <ul className="list-disc ml-5 text-[var(--ink)]/70 leading-relaxed">
                            {product.description.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-10 gap-3 sm:gap-4 text-base">
                            <button
                                onClick={() => addToCart(product._id)}
                                className="
                  w-full py-3.5 cursor-pointer font-medium
                  bg-white text-[var(--ink)]
                  border border-[var(--clay)]/80
                  hover:bg-[var(--clay)]/30 transition rounded-lg
                "
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={() => {
                                    addToCart(product._id);
                                    navigate('/cart');
                                }}
                                className="
                  w-full py-3.5 cursor-pointer font-medium
                  bg-[var(--herbal)] text-white
                  hover:bg-[var(--herbal-dark)]
                  transition rounded-lg
                "
                            >
                                Buy now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related products */}
                <div className="flex flex-col items-center mt-20">
                    <div className="flex flex-col items-center w-max">
                        <p className="text-3xl font-medium text-[var(--ink)]">Related Products</p>
                        <div className="w-20 h-0.5 bg-[var(--herbal)] rounded-full mt-2"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-6 w-full">
                        {relatedProducts
                            .filter((product) => product.inStock)
                            .map((product, index) => (
                                <ProductCard key={index} product={product} />
                            ))}
                    </div>

                    <button
                        onClick={() => {
                            navigate('/products');
                            scrollTo(0, 0);
                        }}
                        className="
              mx-auto cursor-pointer px-12 my-16 py-2.5
              border border-[var(--clay)]/80 rounded
              text-[var(--ink)] bg-white hover:bg-[var(--herbal)] hover:text-white
              transition
            "
                    >
                        See More
                    </button>
                </div>
            </div>
        )
    );
};

export default ProductDetails;
