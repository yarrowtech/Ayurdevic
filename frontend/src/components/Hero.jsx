// import React from 'react'

// const Hero = () => {
//     return (
//         <>
//             <div className="surface soft-ring p-6 md:p-10 rounded-2xl">
//                 <h1 className="font-heading text-4xl md:text-5xl">Hand-poured Candles</h1>
//                 <p className="mt-3 text-base md:text-lg text-neutral-700">
//                     Ayurvedic inspired aromas in reusable ceramic pots.
//                 </p>
//                 <div className="mt-6 flex gap-3">
//                     <button className="btn btn-primary">Shop Candles</button>
//                     <button className="btn btn-secondary">View Collections</button>
//                 </div>
//             </div>

//             <div className='flex flex-wrap gap-6 mt-10'>
//                 <div className="card">
//                     <img src="https://picsum.photos/200/300/?random=1" alt="Sandalwood Candle" className="w-full h-64 object-cover" />
//                     <div className="p-4">
//                         <h3 className="font-heading text-xl">Sandalwood Candle</h3>
//                         <div className="mt-2 flex items-center gap-3">
//                             <span className="price text-2xl">₹899</span>
//                             <span className="badge">In Stock</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <img src="https://picsum.photos/200/300/?random=1" alt="Sandalwood Candle" className="w-full h-64 object-cover" />
//                     <div className="p-4">
//                         <h3 className="font-heading text-xl">Sandalwood Candle</h3>
//                         <div className="mt-2 flex items-center gap-3">
//                             <span className="price text-2xl">₹899</span>
//                             <span className="badge">In Stock</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <img src="https://picsum.photos/200/300/?random=1" alt="Sandalwood Candle" className="w-full h-64 object-cover" />
//                     <div className="p-4">
//                         <h3 className="font-heading text-xl">Sandalwood Candle</h3>
//                         <div className="mt-2 flex items-center gap-3">
//                             <span className="price text-2xl">₹899</span>
//                             <span className="badge">In Stock</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <img src="https://picsum.photos/200/300/?random=1" alt="Sandalwood Candle" className="w-full h-64 object-cover" />
//                     <div className="p-4">
//                         <h3 className="font-heading text-xl">Sandalwood Candle</h3>
//                         <div className="mt-2 flex items-center gap-3">
//                             <span className="price text-2xl">₹899</span>
//                             <span className="badge">In Stock</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <img src="https://picsum.photos/200/300/?random=1" alt="Sandalwood Candle" className="w-full h-64 object-cover" />
//                     <div className="p-4">
//                         <h3 className="font-heading text-xl">Sandalwood Candle</h3>
//                         <div className="mt-2 flex items-center gap-3">
//                             <span className="price text-2xl">₹899</span>
//                             <span className="badge">In Stock</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>

//     )
// }

// export default Hero


// src/components/Hero.jsx
// src/components/Hero.jsx
// src/components/Hero.jsx
// import React from 'react'

// const Hero = () => {
//     return (
//         <section className="flex flex-col md:flex-row items-center justify-between py-20 gap-10">
//             {/* Left Content */}
//             <div className="text-center md:text-left md:w-1/2">
//                 <h1 className="font-heading text-4xl md:text-5xl text-ink">
//                     Hand-poured Ayurvedic Candles
//                 </h1>
//                 <p className="mt-4 font-body text-lg text-gray-700 max-w-md">
//                     Inspired by Ayurveda. Crafted in reusable ceramic pots.
//                     Simple, calming, and natural.
//                 </p>

//                 {/* Buttons */}
//                 <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
//                     <button className="bg-[var(--herbal)] text-white font-body px-6 py-3 rounded-lg hover:bg-herbal-dark transition">
//                         Shop Now
//                     </button>
//                     <button className="border border-herbal text-herbal font-body px-6 py-3 rounded-lg hover:bg-[var(--herbal)] hover:text-white transition">
//                         View Collections
//                     </button>
//                     {/* <button className="bg-gray-100 text-ink font-body px-6 py-3 rounded-lg hover:bg-gray-200 transition">
//                         Learn More
//                     </button> */}
//                 </div>
//             </div>

//             {/* Right Image with Pulsing Glow */}
//             <div className="md:w-1/2 flex justify-center">
//                 <div
//                     className="w-72 h-72 md:w-96 md:h-96 overflow-hidden relative animate-pulse-glow"
//                     style={{ clipPath: "ellipse(43% 50% at 50% 51%)" }}
//                 >
//                     {/* Inner Gradient Glow */}
//                     <div className="absolute inset-0 bg-gradient-to-br from-herbal/30 via-sage/30 to-herbal/10"></div>
//                     {/* Image */}
//                     <img
//                         src="https://picsum.photos/500?random=1"
//                         alt="Ayurvedic Candle"
//                         className="w-full h-full object-cover relative z-10"
//                     />
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Hero

import React from "react";

const Hero = () => {
    return (
        <section className="relative">
      {/* Background accent */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="absolute right-0 top-10 hidden md:block w-72 h-72 rounded-full bg-[var(--herbal)]/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 hidden md:block w-56 h-56 rounded-full bg-[var(--clay)]/40 blur-2xl" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl pt-8 sm:pt-12 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:col-span-6">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--clay)]/80 bg-white/80 px-3 py-1 text-xs tracking-wide text-[var(--ink)]/80">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--herbal)]" />
              Handcrafted • Small-batch • Eco-friendly
            </div>

            <h1 className="mt-5 font-heading text-3xl sm:text-4xl leading-tight text-[var(--ink)] lg:text-5xl xl:text-6xl">
              Serenity, the{" "}
              <span className="text-[var(--herbal)]">Ayurvedic</span> way
            </h1>

            <p className="mt-4 max-w-xl font-body text-base md:text-lg text-[var(--ink)]/75">
              Hand-poured aromatherapy candles inspired by Ayurveda. Natural
              waxes, therapeutic blends, and reusable ceramic jars—crafted to
              calm your space and mind.
            </p>

            {/* CTA Row */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                className="inline-flex items-center justify-center rounded-lg bg-[var(--herbal)] px-6 py-3 text-white shadow-sm transition hover:bg-[var(--herbal-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--herbal)]/40"
              >
                Shop Now
              </button>

              <button
                className="inline-flex items-center justify-center rounded-lg border border-[var(--clay)] bg-white/80 px-6 py-3 text-[var(--herbal)] transition hover:bg-[var(--herbal)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--herbal)]/30"
              >
                View Collections
              </button>

              <div className="flex items-center gap-2 text-sm text-[var(--ink)]/65">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="opacity-80"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m-1 15l-5-5l1.414-1.414L11 14.172l6.586-6.586L19 9z"
                  />
                </svg>
                <span>Non-toxic • Cruelty-free</span>
              </div>
            </div>

            {/* Metrics */}
            {/* <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "4.8★", v: "Avg. Rating" },
                { k: "25K+", v: "Happy Customers" },
                { k: "100%", v: "Natural Waxes" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--clay)]/70 bg-white/70 px-4 py-3 text-center shadow-sm"
                >
                  <div className="font-heading text-xl text-[var(--ink)]">
                    {item.k}
                  </div>
                  <div className="text-xs text-[var(--ink)]/70">{item.v}</div>
                </div>
              ))}
            </div> */}
          </div>

          {/* Right: Visual */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto w-full max-w-xl md:max-w-2xl">
              <div
                className="relative w-full h-80 md:h-[28rem] lg:h-[32rem] overflow-hidden shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] animate-pulse-glow"
                style={{ clipPath: "ellipse(46% 50% at 50% 50%)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--herbal)]/16 via-[var(--clay)]/25 to-[var(--herbal)]/10" />
                <img
                  src="https://picsum.photos/900/900?random=12"
                  alt="Ayurvedic candles arrangement"
                  className="relative z-10 w-full h-full object-cover"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 border border-[var(--clay)]/60" />
              </div>

              <div
                className="absolute -bottom-7 md:-bottom-8 left-1/2 w-[88%] -translate-x-1/2 rounded-xl border border-[var(--clay)]/70 bg-white/80 px-5 py-3 shadow-md backdrop-blur flex items-center justify-between gap-4"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--herbal)] text-white text-xs">
                    ✓
                  </span>
                  <p className="text-sm text-[var(--ink)]/80">
                    Free shipping over ₹999
                  </p>
                </div>
                <span className="hidden sm:inline text-sm text-[var(--ink)]/60">
                  Ships in 24–48 hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Strip */}
        {/* <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            "Therapeutic blends",
            "Reusable jars",
            "Clean ingredients",
            "Made in India",
          ].map((t, i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--clay)]/70 bg-white/70 px-4 py-3 text-center text-sm text-[var(--ink)]/75 shadow-sm"
            >
              {t}
            </div>
          ))}
        </div> */}
      </div>
    </section>
    );
};

export default Hero;


