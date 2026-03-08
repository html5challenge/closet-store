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

    const sorted = [...result].sort((a, b) => {
      switch (sortOption) {
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
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
