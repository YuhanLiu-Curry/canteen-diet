import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddCanteenForm, AddStallForm, AddDishForm, CorrectionQueue } from "./forms";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect("/");

  const canteens = await prisma.canteen.findMany({
    include: { stalls: true },
    orderBy: { name: "asc" },
  });
  const pendingCorrections = await prisma.correction.findMany({
    where: { status: "pending" },
    include: { dish: true, user: { select: { email: true, nickname: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pb-24">
      <div className="w-full max-w-2xl space-y-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">管理后台</h1>
          <Link href="/" className="text-sm text-gray-400 underline">返回应用</Link>
        </div>

        {/* 纠错审核 */}
        <section className="space-y-3">
          <h2 className="font-semibold border-b pb-1">
            纠错审核（{pendingCorrections.length} 待处理）
          </h2>
          <CorrectionQueue corrections={pendingCorrections} />
        </section>

        {/* 录入 */}
        <section className="space-y-3">
          <h2 className="font-semibold border-b pb-1">菜品录入</h2>
          <AddCanteenForm />
          <AddStallForm canteens={canteens} />
          <AddDishForm canteens={canteens} />
        </section>
      </div>
    </main>
  );
}
