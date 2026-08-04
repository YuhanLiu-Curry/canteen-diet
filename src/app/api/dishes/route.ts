import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 搜索菜品（公开，登录后使用）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const dishes = await prisma.dish.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { stall: { include: { canteen: true } } },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json(dishes);
}
