import { render, screen, fireEvent } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import App from "./App";

const renderWithRecoil = () =>
  render(
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );

describe("Product List App", () => {
  it("renders initial products", () => {
    renderWithRecoil();
    const cards = screen.getAllByTestId("product-card");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("filters products based on search query", () => {
    renderWithRecoil();
    const input = screen.getByLabelText(/search products/i);

    fireEvent.change(input, { target: { value: "iphone" } });
    const cards = screen.getAllByTestId("product-card");

    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent(/iphone/i);
  });

  it("shows empty state when no products match", () => {
    renderWithRecoil();
    const input = screen.getByLabelText(/search products/i);

    fireEvent.change(input, { target: { value: "non-existent" } });

    expect(screen.queryByTestId("product-card")).toBeNull();
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});

