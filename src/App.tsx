import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import SearchBar from "./components/SearchBar";
import ProductGrid from "./components/ProductGrid";
import { productsState, type Product } from "./state/products";

const DATA_URL =
  "https://closet-recruiting-api.azurewebsites.net/api/data";

const App = () => {
  const setProducts = useSetRecoilState(productsState);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          // 可以根据需要做错误提示
          return;
        }
        const rawData: any[] = await response.json();
        const mapped: Product[] = rawData.map((item) => ({
          id: item.id,
          creator: item.creator,
          title: item.title,
          pricingOption: item.pricingOption,
          imagePath: item.imagePath,
          price: item.price
        }));
        setProducts(mapped);
      } catch (error) {
        // 这里简单忽略错误，只在控制台打印
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, [setProducts]);

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-header-logo"></span>
      </header>
      <SearchBar />
      <ProductGrid />
    </main>
  );
};

export default App;
