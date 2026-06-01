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
  "Caños",
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

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Corte laser en chapa",
    category: "Servicios",
    price: 25000,
    stock: 99,
    image: DEFAULT_IMAGE,
    description:
      "Servicio de corte laser de alta precision para chapas, piezas especiales y produccion seriada.",
  },
  {
    id: 2,
    name: "Corte laser de caños",
    category: "Caños",
    price: 32000,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    description:
      "Corte de caños y perfiles para estructuras, herreria, muebles industriales y produccion.",
  },
  {
    id: 3,
    name: "Chapas caladas decorativas",
    category: "Chapas",
    price: 27500,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80",
    description:
      "Paneles metalicos calados para frentes, decoracion, cerramientos y proyectos personalizados.",
  },
  {
    id: 4,
    name: "Carteleria metalica",
    category: "Decoracion",
    price: 14500,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1581093458791-9d42cc030ee0?auto=format&fit=crop&w=1200&q=80",
    description:
      "Letras, logos, placas, numeros, carteles y diseños especiales cortados con laser.",
  },
  {
    id: 5,
    name: "Produccion seriada laser",
    category: "Produccion",
    price: 48000,
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80",
    description:
      "Cortes repetitivos para empresas, fabricantes y talleres que buscan precision y velocidad.",
  },
  {
    id: 6,
    name: "Piezas metalicas a medida",
    category: "A medida",
    price: 18500,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80",
    description:
      "Fabricacion de piezas metalicas segun plano, muestra, diseño o necesidad del cliente.",
  },
];

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);
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
    "Hola LaserCut Pro, quiero consultar por estos productos:",
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
    isValid: form.name.trim().length > 0 && Number.isFinite(price) && price > 0,
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
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

export function calculateCartTotal(cart: CartItem[]) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function calculateCartQuantity(cart: CartItem[]) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}
