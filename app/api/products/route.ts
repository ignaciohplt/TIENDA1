import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type ProductBody = {
  name?: string;
  category?: string;
  price?: number | string;
  stock?: number | string;
  image?: string;
  description?: string;
};

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de Supabase");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function normalizeProduct(product: any) {
  return {
    id: Number(product.id),
    name: String(product.name || ""),
    category: String(product.category || "A medida"),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    image: String(product.image || ""),
    description: String(product.description || ""),
  };
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products = (data || []).map(normalizeProduct);

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const receivedPassword = request.headers.get("x-admin-password");

    if (!adminPassword || receivedPassword !== adminPassword) {
      return NextResponse.json(
        { error: "Clave admin incorrecta" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ProductBody;

    const product = {
      name: String(body.name || "").trim(),
      category: String(body.category || "A medida").trim(),
      price: Number(body.price || 0),
      stock: Number(body.stock || 0),
      image: String(body.image || "").trim(),
      description: String(body.description || "").trim(),
    };

    if (!product.name) {
      return NextResponse.json(
        { error: "Falta el nombre del producto" },
        { status: 400 }
      );
    }

    if (product.price <= 0) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (!product.image) {
      return NextResponse.json(
        { error: "Falta la imagen del producto" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: normalizeProduct(data) });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el producto" },
      { status: 500 }
    );
  }
}