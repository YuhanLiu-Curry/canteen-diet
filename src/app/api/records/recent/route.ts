import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 最近吃过的菜品（去重，最新在前），用于快捷再记
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const records = await prisma.mealRecord.findMany({
    where: { userId: session.user.id },
    include: { dish: { include: { stall: { include: { canteen: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const seen = new Set<string>();
  const dishes = [];
  for (const r of records) {
    if (!seen.has(r.dishId)) {
      seen.add(r.dishId);
      dishes.push(r.dish);
    }
    if (dishes.length >= 6) break;
  }
  return NextResponse.json(dishes);
}
