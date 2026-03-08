import type { Product } from "../state/products";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const renderRight = () => {
    if (product.pricingOption === 1) {
      return <span className="product-price">FREE</span>;
    }
    if (product.pricingOption === 2) {
      return (
        <span className="product-price">View Only</span>
      );
    }
    return <p className="product-price">${product.price.toFixed(2)}</p>;
  };

  return (
    <article className="product-card" data-testid="product-card">
      <div className="product-card-image">
        <img src={product.imagePath} alt={product.title} />
      </div>
      <div className="product-card-info">
        <div className="product-card-text">
          <div className="product-title">{product.title}</div>
          <p className="product-description">{product.creator}</p>
        </div>
        <div className="product-card-right">{renderRight()}</div>
      </div>
    </article>
  );
};

export default ProductCard;
