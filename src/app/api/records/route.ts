import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// 记录一餐
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { dishId, mealType, servings } = await request.json();
  if (!dishId || !mealType) {
    return NextResponse.json({ error: "菜品和餐次必填" }, { status: 400 });
  }

  const record = await prisma.mealRecord.create({
    data: {
      userId: session.user.id,
      dishId,
      mealType,
      servings: servings ?? 1,
      date: todayStart(),
    },
    include: { dish: true },
  });
  return NextResponse.json(record);
}

// 查今日记录
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const records = await prisma.mealRecord.findMany({
    where: { userId: session.user.id, date: todayStart() },
    include: { dish: { include: { stall: { include: { canteen: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(records);
}
