import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPersonalStallId } from "@/lib/personal";

// 自定义记录：创建个人菜并直接记一笔（个人菜不进公共库）
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await request.json();
  const { name, kcal, proteinG, carbsG, fatG, mealType, servings } = body;
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || kcal == null || !mealType) {
    return NextResponse.json({ error: "菜名、热量、餐次必填" }, { status: 400 });
  }

  const stallId = await getPersonalStallId();

  // 同用户同名个人菜直接复用，不重复建
  let dish = await prisma.dish.findFirst({
    where: { name: trimmed, userId: session.user.id },
  });
  if (!dish) {
    dish = await prisma.dish.create({
      data: {
        name: trimmed,
        stallId,
        userId: session.user.id,
        kcal,
        proteinG: proteinG ?? 0,
        carbsG: carbsG ?? 0,
        fatG: fatG ?? 0,
        confidence: "estimated",
      },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await prisma.mealRecord.create({
    data: {
      userId: session.user.id,
      dishId: dish.id,
      mealType,
      servings: servings ?? 1,
      date: today,
    },
    include: { dish: true },
  });
  return NextResponse.json(record);
}
