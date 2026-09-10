import React from 'react';
import { useAppContext } from "../context/AppContext";

const Categories = () => {
  const { navigate, categories } = useAppContext();
  if (!categories.length) return null;

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
              navigate(`/products/${encodeURIComponent(category.key)}`);
              scrollTo(0, 0);
            }}
          >
            {/* Image */}
            {category.image ? <img
              src={category.image}
              alt={category.name}
              className="
                h-16 w-16 md:h-20 md:w-20 object-contain
                transition-transform duration-200
                group-hover:scale-105
                drop-shadow-sm
              "
              draggable={false}
            /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-800 md:h-20 md:w-20">{category.name[0]}</span>}

            {/* Label */}
            <p
              className="
                text-xs sm:text-sm font-medium
                text-[var(--ink)]
                text-center leading-tight line-clamp-1
                group-hover:text-[var(--herbal-dark)]
                transition-colors
              "
              title={category.name}
            >
              {category.name}
            </p>
            {category.offer && <p className="w-full break-words rounded-full bg-green-100 px-3 py-1 text-center text-xs text-green-800">{category.offer}</p>}

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
