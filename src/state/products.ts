import { atom, selector } from "recoil";

// 后端定义：paid = 0, free = 1, viewonly = 2
export type PricingOption = 0 | 1 | 2;

export const PRICING_OPTION = {
  PAID: 0 as PricingOption,
  FREE: 1 as PricingOption,
  VIEW_ONLY: 2 as PricingOption
} as const;

const getInitialSearchQuery = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ?? "";
};

const getInitialPricingFilter = (): PricingOption[] => {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("pricing");
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => Number(v))
    .filter((v): v is PricingOption => v === 0 || v === 1 || v === 2);
};

const getInitialPriceRangeFilter = () => {
  if (typeof window === "undefined") return [0, 999];
  const params = new URLSearchParams(window.location.search);
  const min = params.get("minPrice");
  const max = params.get("maxPrice");
  
  const minPrice = min ? Math.max(0, Math.min(999, Number(min))) : 0;
  const maxPrice = max ? Math.max(0, Math.min(999, Number(max))) : 999;
  
  return [minPrice, maxPrice];
};

// 后端接口 https://closet-recruiting-api.azurewebsites.net/api/data 
export type Product = {
  id: string;
  creator: string;
  title: string;
  pricingOption: PricingOption;
  imagePath: string;
  price: number;
};

export const productsState = atom<Product[]>({
  key: "productsState",
  default: []
});

export const searchQueryState = atom<string>({
  key: "searchQueryState",
  default: getInitialSearchQuery()
});

export const pricingOptionFilterState = atom<PricingOption[]>({
  key: "pricingOptionFilterState",
  default: getInitialPricingFilter()
});

export const priceRangeFilterState = atom<[number, number]>({
  key: "priceRangeFilterState",
  default: getInitialPriceRangeFilter()
});

export type SortOption =
  | "relevance"
  | "priceAsc"
  | "priceDesc"
  | "titleAsc"
  | "titleDesc";

export const sortOptionState = atom<SortOption>({
  key: "sortOptionState",
  default: "relevance"
});

export const filteredProductsState = selector<Product[]>({
  key: "filteredProductsState",
  get: ({ get }) => {
    const products = get(productsState);
    const query = get(searchQueryState).toLowerCase().trim();
    const pricingFilter = get(pricingOptionFilterState);
    const priceRange = get(priceRangeFilterState);
    const sortOption = get(sortOptionState);

    let result = products;

    if (query) {
      result = result.filter((p) =>
        `${p.title} ${p.creator}`.toLowerCase().includes(query)
      );
    }

    if (pricingFilter.length > 0) {
      result = result.filter((p) => pricingFilter.includes(p.pricingOption));
    }

    // 价格范围过滤（只有当Paid选项被选中时才应用）
    if (pricingFilter.includes(0)) {
      const [minPrice, maxPrice] = priceRange;
      result = result.filter((p) => {
        if (p.pricingOption === 0) { // 付费产品
          return p.price >= minPrice && p.price <= maxPrice;
        }
        return true; // 免费和viewonly产品不受价格范围限制
      });
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortOption) {
        case "priceAsc":
          // 从低到高：免费(1) → 带价格(0) → viewonly(2)
          if (a.pricingOption === 1 && b.pricingOption !== 1) return -1;
          if (b.pricingOption === 1 && a.pricingOption !== 1) return 1;
          if (a.pricingOption === 2 && b.pricingOption !== 2) return 1;
          if (b.pricingOption === 2 && a.pricingOption !== 2) return -1;
          // 同为付费产品时按价格排序
          if (a.pricingOption === 0 && b.pricingOption === 0) {
            return a.price - b.price;
          }
          return 0;
        case "priceDesc":
          // 从高到低：带价格(0) → 免费(1) → viewonly(2)
          if (a.pricingOption === 0 && b.pricingOption !== 0) return -1;
          if (b.pricingOption === 0 && a.pricingOption !== 0) return 1;
          if (a.pricingOption === 2 && b.pricingOption !== 2) return 1;
          if (b.pricingOption === 2 && a.pricingOption !== 2) return -1;
          // 同为付费产品时按价格排序
          if (a.pricingOption === 0 && b.pricingOption === 0) {
            return b.price - a.price;
          }
          return 0;
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }
});