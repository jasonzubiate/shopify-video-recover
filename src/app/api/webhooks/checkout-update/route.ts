import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { videoQueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.customer?.email) return NextResponse.json({ success: false });

  await prisma.checkout.create({
    data: {
      merchant: { connect: { shop: data.shop } },
      customerEmail: data.customer.email,
      customerName: data.customer.first_name || "",
      productName: data.line_items?.[0]?.title || "Product",
      productImage: data.line_items?.[0]?.image?.src || "",
    },
  });

  await videoQueue.add("render", { checkoutId: data.id });

  return NextResponse.json({ success: true });
}
