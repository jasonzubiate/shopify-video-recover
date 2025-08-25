import fetch from "node-fetch";

export async function createPromoImage(
  productImageUrl: string,
  discountText: string
) {
  const res = await fetch(
    "https://api.canva.com/v1/designs/{TEMPLATE_ID}/render",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CANVA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replacements: {
          product_image: productImageUrl,
          discount_text: discountText,
        },
        format: "png",
      }),
    }
  );

  if (!res.ok) throw new Error(`Canva API failed: ${await res.text()}`);

  const { url } = await res.json();
  return url; // public URL of the generated image
}
