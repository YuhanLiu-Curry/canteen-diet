import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { DeleteRecordButton } from "./delete-button";

const MEAL_LABEL: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.dailyKcalTarget) redirect("/onboarding");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.mealRecord.findMany({
    where: { userId: user.id, date: today },
    include: { dish: { include: { stall: { include: { canteen: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const totals = records.reduce(
    (acc, r) => ({
      kcal: acc.kcal + r.dish.kcal * r.servings,
      protein: acc.protein + r.dish.proteinG * r.servings,
      carbs: acc.carbs + r.dish.carbsG * r.servings,
      fat: acc.fat + r.dish.fatG * r.servings,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = user.dailyKcalTarget - totals.kcal;
  const over = remaining < 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-6 pt-6">
        {/* 今日剩余 — 全页主角 */}
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">
            {over ? "今日已超出" : "今日还可摄入"}
          </p>
          <p className={`text-6xl font-bold ${over ? "text-red-500" : ""}`}>
            {Math.abs(Math.round(remaining))}
          </p>
          <p className="text-sm text-gray-500">
            kcal / 目标 {user.dailyKcalTarget} kcal
          </p>
        </div>

        {/* 宏量营养素 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded border py-2">
            <p className="text-lg font-semibold">{Math.round(totals.protein)}g</p>
            <p className="text-xs text-gray-500">蛋白质</p>
          </div>
          <div className="rounded border py-2">
            <p className="text-lg font-semibold">{Math.round(totals.carbs)}g</p>
            <p className="text-xs text-gray-500">碳水</p>
          </div>
          <div className="rounded border py-2">
            <p className="text-lg font-semibold">{Math.round(totals.fat)}g</p>
            <p className="text-xs text-gray-500">脂肪</p>
          </div>
        </div>

        {/* 记一餐 */}
        <Link
          href="/record/add"
          className="block w-full rounded bg-black py-3 text-center text-white font-medium"
        >
          记一餐
        </Link>

        {/* 今日记录 */}
        <div className="space-y-2">
          <h2 className="font-semibold">今日记录</h2>
          {records.length === 0 && (
            <p className="text-sm text-gray-400">还没有记录，点上方按钮记一餐</p>
          )}
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <p className="font-medium">
                  {r.dish.name}
                  {r.servings !== 1 && (
                    <span className="text-sm text-gray-500"> ×{r.servings}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {MEAL_LABEL[r.mealType] ?? r.mealType} ·{" "}
                  {r.dish.stall.canteen.name} {r.dish.stall.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {Math.round(r.dish.kcal * r.servings)} kcal
                </span>
                <DeleteRecordButton id={r.id} />
              </div>
            </div>
          ))}
        </div>

        {/* 底部链接 */}
        <div className="flex justify-between text-sm text-gray-400 pt-4">
          <Link href="/browse" className="underline">菜品库</Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="underline">退出</button>
          </form>
        </div>
      </div>
    </main>
  );
}
