import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dishVisibleTo } from "@/lib/personal";

// 搜索菜品：公共菜 + 当前用户个人菜
export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const dishes = await prisma.dish.findMany({
    where: {
      isActive: true,
      ...dishVisibleTo(userId),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { stall: { include: { canteen: true } } },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json(dishes);
}
