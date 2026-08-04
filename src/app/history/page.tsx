import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const MEAL_LABEL: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const records = await prisma.mealRecord.findMany({
    where: { userId: session.user.id },
    include: { dish: true },
    orderBy: [{ date: "desc" }, { createdAt: "asc" }],
    take: 200,
  });

  // 按天聚合
  const byDay = new Map<string, { kcal: number; items: typeof records }>();
  for (const r of records) {
    const key = r.date.toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, { kcal: 0, items: [] });
    const day = byDay.get(key)!;
    day.kcal += r.dish.kcal * r.servings;
    day.items.push(r);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">历史记录</h1>
          <Link href="/" className="text-sm text-gray-400 underline">返回今日</Link>
        </div>

        {byDay.size === 0 && (
          <p className="text-sm text-gray-400">还没有记录</p>
        )}

        {[...byDay.entries()].map(([day, { kcal, items }]) => (
          <section key={day} className="space-y-1">
            <div className="flex justify-between items-baseline border-b pb-1">
              <h2 className="font-semibold">{day}</h2>
              <span className="text-sm text-gray-500">{Math.round(kcal)} kcal</span>
            </div>
            {items.map((r) => (
              <div key={r.id} className="flex justify-between text-sm py-1">
                <span>
                  <span className="text-gray-400 text-xs mr-1">
                    {MEAL_LABEL[r.mealType] ?? r.mealType}
                  </span>
                  {r.dish.name}
                  {r.servings !== 1 && (
                    <span className="text-gray-400"> ×{r.servings}</span>
                  )}
                </span>
                <span className="text-gray-600">
                  {Math.round(r.dish.kcal * r.servings)} kcal
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
