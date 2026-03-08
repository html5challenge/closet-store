import { ChangeEvent, useEffect } from "react";
import { useRecoilState } from "recoil";
import { FiSearch, FiX } from "react-icons/fi";
import {
  pricingOptionFilterState,
  PRICING_OPTION,
  PricingOption,
  searchQueryState
} from "../state/products";

const SearchBar = () => {
  const [query, setQuery] = useRecoilState(searchQueryState);
  const [pricingFilter, setPricingFilter] = useRecoilState(
    pricingOptionFilterState
  );

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

    window.history.replaceState(null, "", url.toString());
  }, [query, pricingFilter]);

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
        </div>
        <button
          type="button"
          className="access-filters-reset"
          onClick={handleResetPricing}
        >
          RESET
        </button>
      </div>
    </>
  );
};

export default SearchBar;
