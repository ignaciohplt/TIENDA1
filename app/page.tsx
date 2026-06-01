"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  DEFAULT_IMAGE,
  buildWhatsAppText,
  calculateCartQuantity,
  calculateCartTotal,
  categories,
  emptyForm,
  filterProducts,
  formatMoney,
  initialProducts,
  validateProductForm,
} from "../lib/store";
import type { CartItem, Product, ProductForm } from "../lib/store";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0] || "Todos"
  );
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAdminMode(params.get("admin") === "1");
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(data.error || "No se pudieron cargar los productos");
          setProducts(initialProducts);
          return;
        }

        if (Array.isArray(data.products)) {
          setProducts(data.products as Product[]);
        }
      } catch (error) {
        console.error("Error cargando productos", error);
        setProducts(initialProducts);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, search, selectedCategory);
  }, [products, search, selectedCategory]);

  const cartTotal = calculateCartTotal(cart);
  const cartQuantity = calculateCartQuantity(cart);

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const productInCart = currentCart.find((item) => item.id === product.id);

      if (productInCart) {
        return currentCart.map((item) => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }

          return item;
        });
      }

      return currentCart.concat([{ ...product, quantity: 1 }]);
    });
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) => {
      return currentCart.filter((item) => item.id !== productId);
    });
  }

  function clearCart() {
    setCart([]);
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminMode) {
      alert("No tenés permiso para cargar productos.");
      return;
    }

    const validation = validateProductForm(form);

    if (!validation.isValid) {
      alert("Completá nombre y precio mayor a 0.");
      return;
    }

    const password = window.prompt("Ingrese clave admin");

    if (!password) {
      alert("No ingresaste clave.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category.trim() || "A medida",
      price: validation.price,
      stock: validation.stock,
      image: form.image.trim() || DEFAULT_IMAGE,
      description:
        form.description.trim() ||
        "Producto cargado desde el panel administrador.",
    };

    try {
      setSavingProduct(true);

      const response = await fetch("/api/products", {
        method: editingProductId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(
          editingProductId
            ? { id: editingProductId, ...productData }
            : productData
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo guardar el producto.");
        return;
      }

      if (editingProductId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingProductId
              ? (data.product as Product)
              : product
          )
        );

        setEditingProductId(null);
        alert("Producto editado correctamente.");
      } else {
        setProducts((currentProducts) => {
          return [data.product as Product].concat(currentProducts);
        });

        alert("Producto guardado en la base de datos.");
      }

      setForm(emptyForm);
    } catch (error) {
      console.error("Error guardando producto", error);
      alert("No se pudo guardar el producto.");
    } finally {
      setSavingProduct(false);
    }
  }

  function startEditProduct(product: Product) {
    if (!adminMode) {
      return;
    }

    setEditingProductId(product.id);
    setShowAdmin(true);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      description: product.description,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditProduct() {
    setEditingProductId(null);
    setForm(emptyForm);
  }

  async function deleteProduct(product: Product) {
    if (!adminMode) {
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmed) {
      return;
    }

    const password = window.prompt("Ingrese clave admin");

    if (!password) {
      alert("No ingresaste clave.");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          id: product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo eliminar el producto.");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id)
      );

      setCart((currentCart) =>
        currentCart.filter((item) => item.id !== product.id)
      );

      alert("Producto eliminado correctamente.");
    } catch (error) {
      console.error("Error eliminando producto", error);
      alert("No se pudo eliminar el producto.");
    }
  }

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493415896964";

  const whatsappText = buildWhatsAppText(cart, cartTotal);

  const whatsappUrl =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(whatsappText);

  return (
    <main className="site">
      <header className="header">
        <div className="container headerContent">
          <a className="brand" href="#inicio" aria-label="Metalia Design">
            <img
              src="/logo.svg"
              alt="Metalia Design"
              className="brandLogo"
            />
            <div>
              <strong>Metalia Design</strong>
              <span>Diseño metálico para espacios únicos</span>
            </div>
          </a>

          <nav className="nav">
            <a href="#inicio">Inicio</a>
            <a href="#productos">Productos</a>
            <a href="#servicios">Servicios</a>
            <a href="#opiniones">Opiniones</a>

            {adminMode && (
              <button type="button" onClick={() => setShowAdmin(!showAdmin)}>
                Panel admin
              </button>
            )}

            <a className="cartPill" href="#carrito">
              Carrito: {cartQuantity}
            </a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="heroOverlay" />
        <div className="container heroGrid">
          <div className="heroText">
            <span className="eyebrow">Diseño para hogares y espacios</span>
            <h1>Diseño metálico que transforma espacios.</h1>
            <p>
              Productos de diseño para hogares, locales y espacios comerciales.
              Paneles decorativos, carteles, cuadros, separadores y piezas
              metálicas listas para usar.
            </p>

            <div className="heroActions">
              <a className="primaryButton" href="#productos">
                Ver catálogo
              </a>

              <a
                className="secondaryButton"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Hacer un pedido
              </a>

              {adminMode && (
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => setShowAdmin(true)}
                >
                  Subir producto
                </button>
              )}
            </div>
          </div>

          <div className="heroCard">
            <img
              src="/portada2.png"
              alt="Panel decorativo metálico en ambiente moderno"
            />
            <div className="heroStats">
              <div>
                <strong>+99</strong>
                <span>productos</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>consultas</span>
              </div>
              <div>
                <strong>ÚNICOS</strong>
                <span>diseños</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="benefitsStrip">
        <div className="container benefitsGrid">
          <BenefitItem
            icon="🚚"
            title="Envíos a todo el país"
            text="Rápidos y seguros"
          />
          <BenefitItem
            icon="🔒"
            title="Compra segura"
            text="Protegemos tus datos"
          />
          <BenefitItem
            icon="💬"
            title="24/7"
            text="Atención personalizada"
          />
          <BenefitItem
            icon="🛡️"
            title="Calidad asegurada"
            text="Terminaciones premium"
          />
        </div>
      </section>

      <section id="servicios" className="container serviceGrid">
        <InfoCard
          icon="▧"
          title="Paneles decorativos"
          text="Diseños metálicos calados para dividir, decorar y renovar tus espacios."
        />
        <InfoCard
          icon="✎"
          title="Diseño metálico"
          text="Productos decorativos, cartelería y diseños personalizados."
        />
        <InfoCard
          icon="▣"
          title="Catálogo online"
          text="Productos con foto, precio, stock y descripción."
        />
        <InfoCard
          icon="☏"
          title="Pedido rápido"
          text="Consulta directa por WhatsApp o pago online."
        />
      </section>

      {showAdmin && adminMode && (
        <section className="container adminBox">
          <div className="sectionTitle">
            <span>Panel administrador</span>
            <h2>
              {editingProductId ? "Editar producto" : "Cargar nuevo producto"}
            </h2>
            <p>
              Esta versión guarda los productos en Supabase. Para agregar,
              editar o eliminar, te va a pedir la clave admin.
            </p>
          </div>

          <form className="productForm" onSubmit={addProduct}>
            <InputBox
              label="Nombre"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              placeholder="Ej: Panel divisor de ambientes"
            />

            <InputBox
              label="Categoría"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              placeholder="Ej: Productos"
            />

            <InputBox
              label="Precio"
              type="number"
              value={form.price}
              onChange={(value) => setForm({ ...form, price: value })}
              placeholder="Ej: 25000"
            />

            <InputBox
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(value) => setForm({ ...form, stock: value })}
              placeholder="Ej: 10"
            />

            <label className="field fieldFull">
              <span>URL de imagen</span>
              <input
                value={form.image}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.value })
                }
                placeholder="Ej: /productos/panel-divisor.jpg"
              />
            </label>

            <label className="field fieldFull">
              <span>Descripción</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Descripción breve del producto"
              />
            </label>

            <button
              className="primaryButton fieldFull"
              type="submit"
              disabled={savingProduct}
            >
              {savingProduct
                ? "Guardando..."
                : editingProductId
                ? "Guardar cambios"
                : "Agregar producto"}
            </button>

            {editingProductId && (
              <button
                className="secondaryButton fieldFull"
                type="button"
                onClick={cancelEditProduct}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>
      )}

      <section id="productos" className="container shopGrid">
        <div>
          <div className="sectionTitle shopTitle">
            <div>
              <span>Catálogo</span>
              <h2>Productos</h2>
              <p>Elegí tu producto y consultá directo por WhatsApp.</p>
            </div>

            <label className="searchBox">
              <span>Buscar</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto"
              />
            </label>
          </div>

          <div className="categoryRow">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={selectedCategory === item ? "activeCategory" : ""}
                onClick={() => setSelectedCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loadingProducts ? (
            <div className="emptyProducts">
              <h3>Cargando productos...</h3>
              <p>Estamos consultando la base de datos.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="emptyProducts">
              <h3>No hay productos cargados</h3>
              <p>
                Entrá como administrador para cargar productos y guardarlos en
                Supabase.
              </p>
            </div>
          ) : (
            <div className="productsGrid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => addToCart(product)}
                  onEdit={() => startEditProduct(product)}
                  onDelete={() => deleteProduct(product)}
                  showAdminActions={adminMode}
                />
              ))}
            </div>
          )}
        </div>

        <aside id="carrito" className="cartBox">
          <div className="cartHeader">
            <div>
              <span>Carrito</span>
              <h2>Tu pedido</h2>
            </div>
            <strong>{cartQuantity}</strong>
          </div>

          {cart.length === 0 ? (
            <p className="emptyCart">Todavía no agregaste productos.</p>
          ) : (
            <div className="cartList">
              {cart.map((item) => (
                <div className="cartItem" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      x{item.quantity} -{" "}
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Eliminar"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cartTotal">
            <span>Total</span>
            <strong>{formatMoney(cartTotal)}</strong>
          </div>

          <button
            type="button"
            className="mpButton"
            onClick={() =>
              alert("Acá después se conecta Mercado Pago con Checkout Pro.")
            }
          >
            Pagar con Mercado Pago
          </button>

          <a
            className="whatsappButton"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Comprar por WhatsApp
          </a>

          {cart.length > 0 && (
            <button type="button" className="clearButton" onClick={clearCart}>
              Vaciar carrito
            </button>
          )}
        </aside>
      </section>

      <section id="opiniones" className="container reviewsSection">
        <div className="sectionTitle reviewsTitle">
          <span>Opiniones</span>
          <h2>Lo que valoran nuestros clientes</h2>
          <p>
            Trabajamos cada pedido con atención personalizada, diseño cuidado y
            terminaciones pensadas para que cada pieza se adapte al espacio.
          </p>
        </div>

        <div className="reviewsGrid">
          <article className="reviewCard">
            <div className="reviewStars">★★★★★</div>
            <p>
              “Muy buena atención y asesoramiento para elegir el diseño
              adecuado. Ideal para quienes buscan algo decorativo y a medida.”
            </p>
            <div className="reviewAuthor">
              <img src="/productos/review-1.png" alt="Panel decorativo" />
              <div>
                <strong>Diseño personalizado</strong>
                <span>Paneles y decoración metálica</span>
              </div>
            </div>
          </article>

          <article className="reviewCard">
            <div className="reviewStars">★★★★★</div>
            <p>
              “Los productos tienen una terminación prolija y moderna. Se nota
              el cuidado en los detalles y en la presentación.”
            </p>
            <div className="reviewAuthor">
              <img
                src="/productos/review-2.png"
                alt="Interior con panel metálico"
              />
              <div>
                <strong>Terminación premium</strong>
                <span>Productos metálicos decorativos</span>
              </div>
            </div>
          </article>

          <article className="reviewCard">
            <div className="reviewStars">★★★★★</div>
            <p>
              “Una buena opción para renovar espacios con piezas metálicas
              distintas, modernas y pensadas para hogares, locales u oficinas.”
            </p>
            <div className="reviewAuthor">
              <img src="/productos/review-3.png" alt="Producto metálico" />
              <div>
                <strong>Espacios únicos</strong>
                <span>Diseño metálico para interiores</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="container ctaStrip">
        <div>
          <h2>¿Tenés un proyecto en mente?</h2>
          <p>Contanos tu idea y te ayudamos a hacerlo realidad.</p>
        </div>

        <a
          className="whatsappButton ctaButton"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Consultar por WhatsApp
        </a>
      </section>

      <footer className="footer">
        <strong>Metalia Design</strong>
        <span>Diseños metálicos, decoración y corte láser</span>
      </footer>
    </main>
  );
}

function BenefitItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article className="benefitItem">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article className="infoCard">
      <span className="infoIcon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function InputBox({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function ProductCard({
  product,
  onAdd,
  onEdit,
  onDelete,
  showAdminActions,
}: {
  product: Product;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showAdminActions: boolean;
}) {
  return (
    <article className="productCard">
      <div className="productImage">
        <img src={product.image} alt={product.name} />
        <span>{product.category}</span>
      </div>

      <div className="productBody">
        <small>Stock: {product.stock}</small>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="productFooter">
          <strong>{formatMoney(product.price)}</strong>
          <button type="button" onClick={onAdd}>
            Comprar
          </button>
        </div>

        {showAdminActions && (
          <div className="adminProductActions">
            <button type="button" className="editButton" onClick={onEdit}>
              Editar
            </button>
            <button type="button" className="deleteButton" onClick={onDelete}>
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
