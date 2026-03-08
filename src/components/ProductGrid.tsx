import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { filteredProductsState } from "../state/products";
import ProductCard from "./ProductCard";

const CHUNK_SIZE = 8;

const ProductGrid = () => {
  const products = useRecoilValue(filteredProductsState);
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [products]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const target = sentinelRef.current;
    let timeoutId: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        setIsLoadingMore(true);
        setVisibleCount((prev) => {
          if (prev >= products.length) {
            setIsLoadingMore(false);
            return prev;
          }
          const next = prev + CHUNK_SIZE;
          const clamped = next > products.length ? products.length : next;
          window.clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => {
            setIsLoadingMore(false);
          }, 2000);
          return clamped;
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [products.length]);

  if (!products.length) {
    return <p className="empty-state">No products found.</p>;
  }

  return (
    <>
      <section className="product-grid" aria-label="product list">
        {products.slice(0, visibleCount).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {isLoadingMore &&
          Array.from({ length: CHUNK_SIZE }).map((_, index) => (
            <article
              key={`skeleton-${index}`}
              className="product-card product-card-skeleton"
              aria-hidden="true"
            >
              <div className="product-card-image skeleton-block" />
              <div className="product-card-info">
                <div className="product-card-text">
                  <div className="skeleton-line skeleton-line-title" />
                  <div className="skeleton-line skeleton-line-subtitle" />
                </div>
                <div className="skeleton-pill" />
              </div>
            </article>
          ))}
      </section>
      {visibleCount < products.length && (
          <div
            ref={sentinelRef}
            className="infinite-scroll-sentinel"
            aria-hidden="true"
          />
      )}
    </>
  );
};

export default ProductGrid;
