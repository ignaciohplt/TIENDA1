import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
};

type CustomerData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
};

type DeliveryData = {
  estimatedDate: string;
  estimatedText: string;
  businessDays: number;
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta configurar MP_ACCESS_TOKEN en Vercel." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Faltan las variables de Supabase en Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const cart = body.cart as CartItem[];
    const customer = body.customer as CustomerData;
    const delivery = body.delivery as DeliveryData;

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    const customerName = cleanText(customer?.name);
    const customerPhone = cleanText(customer?.phone);
    const customerEmail = cleanText(customer?.email);
    const customerAddress = cleanText(customer?.address);
    const customerCity = cleanText(customer?.city);
    const customerNotes = cleanText(customer?.notes);

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !customerAddress ||
      !customerCity
    ) {
      return NextResponse.json(
        { error: "Faltan datos del cliente." },
        { status: 400 }
      );
    }

    const deliveryDate = cleanText(delivery?.estimatedDate).slice(0, 10);
    const deliveryText = cleanText(delivery?.estimatedText);

    if (!deliveryDate || !deliveryText) {
      return NextResponse.json(
        { error: "Falta la fecha estimada de entrega." },
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

    const total = validCart.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    const origin =
      request.headers.get("origin") || "https://tienda-1-pi.vercel.app";

    const externalReference =
      "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

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

          payer: {
            name: customerName,
            email: customerEmail,
            phone: {
              number: customerPhone,
            },
            address: {
              street_name: customerAddress,
            },
          },

          external_reference: externalReference,

          metadata: {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            customer_address: customerAddress,
            customer_city: customerCity,
            customer_notes: customerNotes,
            delivery_estimated_date: deliveryDate,
            delivery_estimated_text: deliveryText,
            delivery_business_days: "5",
          },

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
            data?.message || "Mercado Pago rechazó la creación del pago.",
        },
        { status: 500 }
      );
    }

    const initPoint = data.init_point || data.sandbox_init_point;

    if (!initPoint) {
      return NextResponse.json(
        { error: "Mercado Pago no devolvió link de pago." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: orderError } = await supabase.from("orders").insert({
      external_reference: externalReference,
      preference_id: data.id || null,
      status: "pending",

      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_address: customerAddress,
      customer_city: customerCity,
      customer_notes: customerNotes,

      delivery_estimated_date: deliveryDate,
      delivery_estimated_text: deliveryText,

      total,
      cart: validCart,
      init_point: initPoint,
    });

    if (orderError) {
      console.error("Error guardando pedido en Supabase:", orderError);

      return NextResponse.json(
        { error: "No se pudo guardar el pedido en Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: initPoint,
      external_reference: externalReference,
    });
  } catch (error) {
    console.error("Error creando pago:", error);

    return NextResponse.json(
      { error: "No se pudo iniciar Mercado Pago." },
      { status: 500 }
    );
  }
}
