export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// 🔹 PUT → atualizar
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      price: Number(body.price), // 👈 Garante que seja número
      images: body.images,
      stock: Number(body.stock), // 👈 Se mudar o estoque, precisa converter
      categoryId: body.categoryId || null, // 👈 Evita erro de chave estrangeira
    },
  });

  return NextResponse.json(product);
}

// 🔹 DELETE → remover
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    // 1. Deleta variações primeiro
    await prisma.variation.deleteMany({ where: { productId: id } });
    
    // 2. Deleta o produto
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    // Se cair aqui, é porque o produto está em um pedido (OrderItem)
    return NextResponse.json(
      { error: "Não é possível excluir: este produto está em um pedido ativo." }, 
      { status: 400 }
    );
  }
}
