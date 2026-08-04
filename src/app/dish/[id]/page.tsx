import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CorrectionForm } from "./correction-form";

const CONFIDENCE_INFO: Record<string, { label: string; desc: string }> = {
  estimated: { label: "估算", desc: "按菜名匹配食物库标准值，未实地校准" },
  calibrated: { label: "已校准", desc: "经实地就餐/询问窗口确认过分量" },
  verified: { label: "已验证", desc: "经用户纠错审核确认" },
  label: { label: "包装标签", desc: "直接抄录食品包装营养标签，最准" },
};

export default async function DishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const dish = await prisma.dish.findUnique({
    where: { id },
    include: { stall: { include: { canteen: true } } },
  });
  if (!dish) notFound();

  const conf = CONFIDENCE_INFO[dish.confidence];
  const macros = [
    { label: "蛋白质", v: dish.proteinG, color: "#16a34a" },
    { label: "碳水", v: dish.carbsG, color: "#f59e0b" },
    { label: "脂肪", v: dish.fatG, color: "#8b5cf6" },
  ];

  return (
    <main className="min-h-screen pb-8">
      <div className="mx-auto w-full max-w-md px-4 space-y-5 pt-6">
        <Link href="/browse" className="text-sm text-gray-400">← 菜品库</Link>

        <div className="rounded-3xl bg-white shadow-sm p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{dish.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {dish.stall.canteen.name} · {dish.stall.name}
          </p>
          <p className="mt-4">
            <span className="text-5xl font-bold text-brand">{Math.round(dish.kcal)}</span>
            <span className="text-gray-400 text-sm ml-1">kcal / 份</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {macros.map((m) => (
            <div key={m.label} className="rounded-2xl bg-white shadow-sm py-3 text-center">
              <p className="text-lg font-bold" style={{ color: m.color }}>
                {Math.round(m.v)}<span className="text-xs font-normal">g</span>
              </p>
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            数据可信度：{conf?.label ?? dish.confidence}
          </p>
          <p className="text-xs text-amber-600">{conf?.desc}</p>
        </div>

        <CorrectionForm dishId={dish.id} dishName={dish.name} />
      </div>
    </main>
  );
}
