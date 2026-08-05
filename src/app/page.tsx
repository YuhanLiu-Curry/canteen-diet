import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { DeleteRecordButton } from "./delete-button";
import { QuickRecord } from "./quick-record";

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

  const target = user.dailyKcalTarget;
  const remaining = target - totals.kcal;
  const over = remaining < 0;
  const pct = Math.min(totals.kcal / target, 1);

  // 圆环参数
  const R = 84;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - pct);

  return (
    <main className="min-h-screen pb-28">
      <div className="mx-auto w-full max-w-md px-4 space-y-6 pt-6">
        {/* 顶部问候 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">今天也要好好吃饭</p>
            <h1 className="text-lg font-bold">{user.nickname ?? "同学"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {user.isAdmin && (
              <Link href="/admin" className="text-xs text-gray-400">
                管理后台
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-xs text-gray-400">退出</button>
            </form>
          </div>
        </div>

        {/* 热量圆环卡 */}
        <div className="rounded-3xl bg-white shadow-sm p-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={R} fill="none" stroke="#eef2ee" strokeWidth="16" />
                <circle
                  cx="100" cy="100" r={R} fill="none"
                  stroke={over ? "#ef4444" : "#16a34a"}
                  strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${over ? "text-red-500" : "text-gray-900"}`}>
                  {Math.abs(Math.round(remaining))}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {over ? "已超出 kcal" : "还可摄入 kcal"}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            已摄入 {Math.round(totals.kcal)} / 目标 {target} kcal
          </p>

          {/* 宏量营养素 */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "蛋白质", v: totals.protein, color: "#16a34a" },
              { label: "碳水", v: totals.carbs, color: "#f59e0b" },
              { label: "脂肪", v: totals.fat, color: "#8b5cf6" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-gray-50 py-3 text-center">
                <p className="text-lg font-bold" style={{ color: m.color }}>
                  {Math.round(m.v)}<span className="text-xs font-normal">g</span>
                </p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷再记 */}
        <QuickRecord />

        {/* 今日记录 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">今日记录</h2>
            <Link href="/history" className="text-xs text-gray-400">历史 ›</Link>
          </div>
          {records.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400">
              还没有记录，点击下方按钮记一餐
            </div>
          )}
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {r.dish.name}
                  {r.servings !== 1 && (
                    <span className="text-sm text-gray-400"> ×{r.servings}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {MEAL_LABEL[r.mealType] ?? r.mealType} ·{" "}
                  {r.dish.userId ? "我的自定义" : `${r.dish.stall.canteen.name} ${r.dish.stall.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-brand">
                  {Math.round(r.dish.kcal * r.servings)} kcal
                </span>
                <DeleteRecordButton id={r.id} />
              </div>
            </div>
          ))}
        </div>

        {/* 菜品库入口 */}
        <Link
          href="/browse"
          className="block rounded-2xl bg-white p-4 shadow-sm text-center text-sm text-gray-600"
        >
          浏览菜品库 ›
        </Link>
      </div>

      {/* 底部悬浮记一餐 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f7f8f7] via-[#f7f8f7] to-transparent">
        <div className="mx-auto max-w-md">
          <Link
            href="/record/add"
            className="block w-full rounded-2xl bg-brand py-4 text-center text-white font-semibold shadow-lg active:bg-brand-dark"
          >
            ＋ 记一餐
          </Link>
        </div>
      </div>
    </main>
  );
}
