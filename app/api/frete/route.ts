import { NextResponse } from "next/server"

console.log("ENV CHECK:", {
  BASE: process.env.MELHOR_ENVIO_BASE_URL,
  TOKEN: !!process.env.MELHOR_ENVIO_TOKEN,
  FROM: process.env.MELHOR_ENVIO_FROM_CEP,
})

export async function POST(req: Request) {
  try {
    if (!process.env.MELHOR_ENVIO_TOKEN) {
      return NextResponse.json(
        { error: "Token do Melhor Envio não configurado" },
        { status: 500 }
      )
    }

    if (!process.env.MELHOR_ENVIO_FROM_CEP) {
      return NextResponse.json(
        { error: "CEP de origem não configurado" },
        { status: 500 }
      )
    }

    const { cepDestino, items } = await req.json()

    if (!cepDestino || !items?.length) {
      return NextResponse.json(
        { error: "CEP destino ou itens inválidos" },
        { status: 400 }
      )
    }

    const payload = {
      from: {
        postal_code: process.env.MELHOR_ENVIO_FROM_CEP,
      },
      to: {
        postal_code: cepDestino,
      },
      products: items.map((item: any) => ({
        id: String(item.id),
        width: Math.max(Number(item.width), 11),
        height: Math.max(Number(item.height), 2),
        length: Math.max(Number(item.length), 16),
        weight: Math.max(Number(item.weight), 0.1),
        insurance_value: Number(item.price ?? 10),
        quantity: item.quantity,
      })),
    }

    const res = await fetch(
      `${process.env.MELHOR_ENVIO_BASE_URL}/api/v2/me/shipment/calculate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "VeraFashionKids (contato@seudominio.com)",
        },
        body: JSON.stringify(payload),
      }
    )

    const text = await res.text()

    if (!res.ok) {
      console.error("❌ Erro Melhor Envio:", text)
      return NextResponse.json(
        { error: "Erro Melhor Envio", details: text },
        { status: res.status }
      )
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error("❌ Resposta não JSON:", text)
      return NextResponse.json(
        { error: "Resposta inválida do Melhor Envio", raw: text },
        { status: 502 }
      )
    }

    // 🔽 extrai PAC e SEDEX
    const pac = data.find((s: any) => s.name === "PAC")
    const sedex = data.find((s: any) => s.name === "SEDEX")

    return NextResponse.json({
      pac: pac
        ? {
            price: Number(pac.price),
            deadline: pac.delivery_time,
          }
        : null,
      sedex: sedex
        ? {
            price: Number(sedex.price),
            deadline: sedex.delivery_time,
          }
        : null,
    })
  } catch (err) {
    console.error("🔥 Erro interno frete:", err)
    return NextResponse.json(
      { error: "Erro interno ao calcular frete" },
      { status: 500 }
    )
  }
}
