export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type ProductForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  description: string;
};

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1200&q=80";

export const categories = [
  "Todos",
  "Servicios",
  "Canos",
  "Chapas",
  "Decoracion",
  "Produccion",
  "A medida",
];

export const emptyForm: ProductForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
};

export const initialProducts: Product[] = [];

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function calculateCartTotal(cart: CartItem[]) {
  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

export function calculateCartQuantity(cart: CartItem[]) {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

export function buildWhatsAppText(cart: CartItem[], total: number) {
  const lineBreak = String.fromCharCode(10);

  const productLines = cart.map((item) => {
    return (
      "- " +
      item.name +
      " x" +
      item.quantity +
      " = " +
      formatMoney(item.price * item.quantity)
    );
  });

  const messageLines = [
    "Hola MetalTec, quiero consultar por estos productos:",
    "",
  ]
    .concat(productLines)
    .concat(["", "Total aproximado: " + formatMoney(total)]);

  return messageLines.join(lineBreak);
}

export function validateProductForm(form: ProductForm) {
  const price = Number(form.price);
  const stock = Number(form.stock || 0);

  return {
    isValid:
      form.name.trim().length > 0 &&
      Number.isFinite(price) &&
      price > 0,
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
  };
}

export function createProductFromForm(form: ProductForm): Product | null {
  const validation = validateProductForm(form);

  if (!validation.isValid) {
    return null;
  }

  return {
    id: Date.now(),
    name: form.name.trim(),
    category: form.category.trim() || "A medida",
    price: validation.price,
    stock: validation.stock,
    image: form.image.trim() || DEFAULT_IMAGE,
    description:
      form.description.trim() ||
      "Producto cargado desde el panel administrador.",
  };
}

export function filterProducts(
  products: Product[],
  search: string,
  selectedCategory: string
) {
  const term = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesText =
      term.length === 0 ||
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;

    return matchesText && matchesCategory;
  });
}

export function getFilteredProducts(
  products: Product[],
  search: string,
  selectedCategory: string
) {
  return filterProducts(products, search, selectedCategory);
}

export function addProductToCart(cart: CartItem[], product: Product) {
  const productInCart = cart.find((item) => item.id === product.id);

  if (productInCart) {
    return cart.map((item) => {
      if (item.id === product.id) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });
  }

  return cart.concat([
    {
      ...product,
      quantity: 1,
    },
  ]);
}

export function removeProductFromCart(cart: CartItem[], productId: number) {
  return cart.filter((item) => item.id !== productId);
}

export const __tests__ = {
  formatMoney,
  calculateCartTotal,
  calculateCartQuantity,
  buildWhatsAppText,
  validateProductForm,
  createProductFromForm,
  filterProducts,
  getFilteredProducts,
  addProductToCart,
  removeProductFromCart,
};
