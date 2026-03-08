import { ChangeEvent, useEffect } from "react";
import { useRecoilState } from "recoil";
import { FiSearch, FiX } from "react-icons/fi";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  pricingOptionFilterState,
  priceRangeFilterState,
  PRICING_OPTION,
  PricingOption,
  searchQueryState,
  sortOptionState,
  type SortOption
} from "../state/products";

const SearchBar = () => {
  const [query, setQuery] = useRecoilState(searchQueryState);
  const [pricingFilter, setPricingFilter] = useRecoilState(
    pricingOptionFilterState
  );
  const [priceRange, setPriceRange] = useRecoilState(priceRangeFilterState);
  const [sortOption, setSortOption] = useRecoilState(sortOptionState);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleClearQuery = () => {
    setQuery("");
  };

  const handlePricingChange = (option: PricingOption) => {
    setPricingFilter((prev) =>
      prev.includes(option)
        ? prev.filter((t) => t !== option)
        : [...prev, option]
    );
  };

  const isChecked = (option: PricingOption) => pricingFilter.includes(option);

  const handleResetPricing = () => {
    setPricingFilter([]);
  };

  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      const [newMin, newMax] = value;
      const finalValues = newMax < newMin ? [newMin, newMin] : [newMin, newMax];

      setPriceRange(finalValues as [number, number]);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      url.searchParams.set("q", trimmedQuery);
    } else {
      url.searchParams.delete("q");
    }

    if (pricingFilter.length > 0) {
      url.searchParams.set("pricing", pricingFilter.join(","));
    } else {
      url.searchParams.delete("pricing");
    }

    const [minPrice, maxPrice] = priceRange;
    if (minPrice > 0 || maxPrice < 999) {
      url.searchParams.set("minPrice", minPrice.toString());
      url.searchParams.set("maxPrice", maxPrice.toString());
    } else {
      url.searchParams.delete("minPrice");
      url.searchParams.delete("maxPrice");
    }

    window.history.replaceState(null, "", url.toString());
  }, [query, pricingFilter, priceRange]);

  return (
    <>
      <div className="search-bar">
        <div className="search-bar-inner">
          <button
            type="button"
            className="search-icon-button"
            aria-label="search"
          >
            <FiSearch />
          </button>
          <input
            aria-label="search products"
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Find the Items you're looking for"
          />
          {query && (
            <button
              type="button"
              className="search-clear-button"
              aria-label="clear search"
              onClick={handleClearQuery}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>
      <div className="access-filters" aria-label="pricing options filters">
        <div className="access-filters-left">
          <span>Pricing Options</span>
          <label className="access-filter-option">
            <input
              type="checkbox"
              checked={isChecked(PRICING_OPTION.PAID)}
              onChange={() => handlePricingChange(PRICING_OPTION.PAID)}
            />
            <span>Paid</span>
          </label>
          <label className="access-filter-option">
            <input
              type="checkbox"
              checked={isChecked(PRICING_OPTION.FREE)}
              onChange={() => handlePricingChange(PRICING_OPTION.FREE)}
            />
            <span>Free</span>
          </label>
          <label className="access-filter-option">
            <input
              type="checkbox"
              checked={isChecked(PRICING_OPTION.VIEW_ONLY)}
              onChange={() => handlePricingChange(PRICING_OPTION.VIEW_ONLY)}
            />
            <span>View only</span>
          </label>
          <div className="price-slider-container">
            <span>${priceRange[0]}</span>
            <Slider
              range
              min={0}
              max={999}
              value={priceRange}
              onChange={handlePriceRangeChange}
              className="price-slider"
              disabled={!isChecked(PRICING_OPTION.PAID)}
              trackStyle={[{ backgroundColor: "#38bdf8" }]}
              handleStyle={[
                { 
                  borderColor: "#38bdf8", 
                  backgroundColor: "#38bdf8"
                },
                { 
                  borderColor: "#38bdf8", 
                  backgroundColor: "#38bdf8"
                }
              ]}
              railStyle={{ backgroundColor: "#4b5563" }}
              // minBoundary={priceRange[0]}
              // maxBoundary={priceRange[1]}
            />
            <span>${priceRange[1]}</span>
          </div>
        </div>
        <button
          type="button"
          className="access-filters-reset"
          onClick={handleResetPricing}
        >
          RESET
        </button>
      </div>
      <div className="sort-by-row" aria-label="sort options">
        <label className="sort-by-label">
          <span className="sort-by-text">Sort by</span>
          <select
            className="sort-by-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="sort by"
          >
            <option value="relevance">Relevance</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="titleAsc">Title: A to Z</option>
            <option value="titleDesc">Title: Z to A</option>
          </select>
        </label>
      </div>
    </>
  );
};

export default SearchBar;