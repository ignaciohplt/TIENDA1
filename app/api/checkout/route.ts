import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta configurar MP_ACCESS_TOKEN en Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const cart = body.cart as CartItem[];

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    const validCart = cart.filter((item) => {
      return (
        item &&
        item.name &&
        Number(item.price) > 0 &&
        Number(item.quantity) > 0
      );
    });

    if (validCart.length === 0) {
      return NextResponse.json(
        { error: "El carrito no tiene productos válidos." },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get("origin") || "https://tienda-1-pi.vercel.app";

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: validCart.map((item) => ({
            id: String(item.id),
            title: String(item.name),
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            currency_id: "ARS",
          })),
          back_urls: {
            success: origin,
            failure: origin,
            pending: origin,
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Error Mercado Pago:", data);

      return NextResponse.json(
        {
          error:
            data?.message ||
            "Mercado Pago rechazó la creación del pago.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: data.init_point || data.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creando pago:", error);

    return NextResponse.json(
      { error: "No se pudo iniciar Mercado Pago." },
      { status: 500 }
    );
  }
}