import React from 'react';
import { categories } from '../assets/assets';
import { useAppContext } from "../context/AppContext";

const Categories = () => {
  const { navigate } = useAppContext();

  return (
    <section className="mt-16">
      {/* Heading */}
      <h2 className="text-center text-2xl md:text-3xl text-[var(--ink)] font-bold">
        Categories
      </h2>
      

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-5 md:gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="
              group cursor-pointer select-none relative
              rounded px-4 py-5
              bg-white
              border border-[var(--clay)]/70 dark:border-white/10
              shadow-sm backdrop-blur
              transition-all duration-200
              hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--herbal)]/20
              focus:outline-none focus:ring-2 focus:ring-[var(--herbal)]/50
              flex flex-col items-center justify-center gap-3
            "
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            {/* Image */}
            <img
              src={category.image}
              alt={category.text}
              className="
                h-16 w-16 md:h-20 md:w-20 object-contain
                transition-transform duration-200
                group-hover:scale-105
                drop-shadow-sm
              "
              draggable={false}
            />

            {/* Label */}
            <p
              className="
                text-xs sm:text-sm font-medium
                text-[var(--ink)]
                text-center leading-tight line-clamp-1
                group-hover:text-[var(--herbal-dark)]
                transition-colors
              "
              title={category.text}
            >
              {category.text}
            </p>

            {/* Herbal accent glow */}
            <div className="pointer-events-none absolute rounded-2xl inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--herbal)]/10 to-[var(--clay)]/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
