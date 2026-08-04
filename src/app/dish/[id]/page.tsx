import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CorrectionForm } from "./correction-form";

const CONFIDENCE_LABEL: Record<string, { label: string; desc: string }> = {
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

  const conf = CONFIDENCE_LABEL[dish.confidence];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md space-y-6 pt-6">
        <Link href="/browse" className="text-sm text-gray-400">← 菜品库</Link>

        <div>
          <h1 className="text-2xl font-bold">{dish.name}</h1>
          <p className="text-sm text-gray-500">
            {dish.stall.canteen.name} · {dish.stall.name}
          </p>
        </div>

        {/* 营养数据 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded border py-3">
            <p className="text-xl font-bold">{Math.round(dish.kcal)}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="rounded border py-3">
            <p className="text-xl font-bold">{Math.round(dish.proteinG)}g</p>
            <p className="text-xs text-gray-500">蛋白质</p>
          </div>
          <div className="rounded border py-3">
            <p className="text-xl font-bold">{Math.round(dish.carbsG)}g</p>
            <p className="text-xs text-gray-500">碳水</p>
          </div>
          <div className="rounded border py-3">
            <p className="text-xl font-bold">{Math.round(dish.fatG)}g</p>
            <p className="text-xs text-gray-500">脂肪</p>
          </div>
        </div>

        {/* 可信度 */}
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-sm font-medium">数据可信度：{conf?.label ?? dish.confidence}</p>
          <p className="text-xs text-gray-500">{conf?.desc}</p>
        </div>

        {/* 纠错 */}
        <CorrectionForm dishId={dish.id} dishName={dish.name} />
      </div>
    </main>
  );
}
