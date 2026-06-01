import { describe, expect, it } from "vitest";
import {
  CartItem,
  ProductForm,
  buildWhatsAppText,
  calculateCartQuantity,
  calculateCartTotal,
  filterProducts,
  formatMoney,
  initialProducts,
  validateProductForm,
} from "../lib/store";

describe("formatMoney", () => {
  it("formats ARS prices", () => {
    expect(formatMoney(25000)).toContain("25");
  });
});

describe("buildWhatsAppText", () => {
  it("includes products and total", () => {
    const cart: CartItem[] = [
      {
        id: 10,
        name: "Corte laser",
        category: "Servicios",
        price: 1000,
        stock: 1,
        image: "image.jpg",
        description: "test",
        quantity: 2,
      },
    ];

    const text = buildWhatsAppText(cart, 2000);

    expect(text).toContain("Corte laser");
    expect(text).toContain("x2");
    expect(text).toContain("Total aproximado");
  });
});

describe("validateProductForm", () => {
  it("rejects empty product names", () => {
    const form: ProductForm = {
      name: "",
      category: "Chapas",
      price: "1000",
      stock: "5",
      image: "",
      description: "",
    };

    expect(validateProductForm(form).isValid).toBe(false);
  });

  it("accepts a valid product", () => {
    const form: ProductForm = {
      name: "Chapa laser",
      category: "Chapas",
      price: "1000",
      stock: "5",
      image: "",
      description: "",
    };

    const result = validateProductForm(form);

    expect(result.isValid).toBe(true);
    expect(result.price).toBe(1000);
    expect(result.stock).toBe(5);
  });
});

describe("filterProducts", () => {
  it("filters by search text", () => {
    const result = filterProducts(initialProducts, "chapa", "Todos");
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by category", () => {
    const result = filterProducts(initialProducts, "", "Servicios");
    expect(result.every((product) => product.category === "Servicios")).toBe(true);
  });
});

describe("cart calculations", () => {
  it("calculates total and quantity", () => {
    const cart: CartItem[] = [
      {
        id: 1,
        name: "Producto 1",
        category: "Servicios",
        price: 100,
        stock: 10,
        image: "image.jpg",
        description: "test",
        quantity: 3,
      },
      {
        id: 2,
        name: "Producto 2",
        category: "Chapas",
        price: 50,
        stock: 10,
        image: "image.jpg",
        description: "test",
        quantity: 2,
      },
    ];

    expect(calculateCartTotal(cart)).toBe(400);
    expect(calculateCartQuantity(cart)).toBe(5);
  });
});
