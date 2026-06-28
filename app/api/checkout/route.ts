import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trelloKey = process.env.TRELLO_KEY;
    const trelloToken = process.env.TRELLO_TOKEN;
    const trelloListId = process.env.TRELLO_LIST_ID;

    if (!trelloKey || !trelloToken || !trelloListId) {
      return NextResponse.json(
        {
          error: "Faltan variables de Trello",
          variables: {
            TRELLO_KEY: Boolean(trelloKey),
            TRELLO_TOKEN: Boolean(trelloToken),
            TRELLO_LIST_ID: Boolean(trelloListId),
          },
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      key: trelloKey,
      token: trelloToken,
      idList: trelloListId,
      name: "Prueba desde Metalia Design",
      desc: "Si esta tarjeta aparece, Trello está conectado correctamente.",
      pos: "top",
    });

    const response = await fetch("https://api.trello.com/1/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Trello rechazó la tarjeta",
          trelloResponse: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Tarjeta creada en Trello",
      cardUrl: data.url,
    });
  } catch (error) {
    console.error("Error test Trello:", error);

    return NextResponse.json(
      { error: "Error creando tarjeta de prueba" },
      { status: 500 }
    );
  }
}
