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

const CONFIDENCE_STYLE: Record<string, string> = {
  estimated: "bg-gray-100 text-gray-500",
  calibrated: "bg-blue-100 text-blue-600",
  verified: "bg-green-100 text-green-600",
  label: "bg-emerald-100 text-emerald-700",
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
    <main className="min-h-screen pb-8">
      <div className="mx-auto w-full max-w-md px-4 space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">菜品库</h1>
          <Link href="/" className="text-sm text-gray-400">返回今日</Link>
        </div>

        {canteens.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400">
            菜品库建设中…
          </div>
        )}

        {canteens.map((c) => (
          <section key={c.id} className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {c.name}
              {c.type === "convenience_store" && (
                <span className="text-xs font-normal bg-brand-soft text-brand-dark rounded-full px-2 py-0.5">
                  便利店
                </span>
              )}
            </h2>
            {c.stalls.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <h3 className="text-sm font-medium text-gray-400">{s.name}</h3>
                <div className="space-y-1.5">
                  {s.dishes.map((d) => (
                    <Link
                      key={d.id}
                      href={`/dish/${d.id}`}
                      className="flex items-center justify-between rounded-2xl bg-white shadow-sm px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{d.name}</span>
                        {d.servingDesc && (
                          <span className="text-xs text-gray-400">{d.servingDesc}</span>
                        )}
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 ${CONFIDENCE_STYLE[d.confidence] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {CONFIDENCE_LABEL[d.confidence] ?? d.confidence}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-brand">
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
