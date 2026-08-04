import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const CONFIDENCE_LABEL: Record<string, string> = {
  estimated: "估算",
  calibrated: "已校准",
  verified: "已验证",
  label: "包装标签",
};

export default async function BrowsePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const canteens = await prisma.canteen.findMany({
    include: {
      stalls: {
        include: {
          dishes: { where: { isActive: true }, orderBy: { name: "asc" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">菜品库</h1>
          <Link href="/" className="text-sm text-gray-400 underline">返回今日</Link>
        </div>

        {canteens.length === 0 && (
          <p className="text-sm text-gray-400">菜品库建设中…</p>
        )}

        {canteens.map((c) => (
          <section key={c.id} className="space-y-3">
            <h2 className="font-semibold text-lg border-b pb-1">
              {c.name}
              {c.type === "convenience_store" && (
                <span className="ml-2 text-xs text-gray-400">便利店</span>
              )}
            </h2>
            {c.stalls.map((s) => (
              <div key={s.id} className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">{s.name}</h3>
                <div className="space-y-1">
                  {s.dishes.map((d) => (
                    <Link
                      key={d.id}
                      href={`/dish/${d.id}`}
                      className="flex items-center justify-between rounded border px-3 py-2"
                    >
                      <div>
                        <span className="font-medium">{d.name}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          {CONFIDENCE_LABEL[d.confidence] ?? d.confidence}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(d.kcal)} kcal
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
