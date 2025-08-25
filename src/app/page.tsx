import { prisma } from "@/prisma";

export default async function Home() {
  const merchants = await prisma.merchant.findMany({
    include: { checkouts: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Recovered Revenue</h1>
      {merchants.map((m) => (
        <div key={m.id} className="mt-4 border p-4 rounded">
          <h2>{m.shop}</h2>
          <p>Total carts: {m.checkouts.length}</p>
          <p>Recovered: {m.checkouts.filter((c) => c.recovered).length}</p>
        </div>
      ))}
    </div>
  );
}
