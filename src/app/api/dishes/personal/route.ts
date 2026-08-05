import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 当前用户的个人自定义菜
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const dishes = await prisma.dish.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, kcal: true, proteinG: true, servingDesc: true },
  });
  return NextResponse.json(dishes);
}
