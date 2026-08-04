import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { dishId, field, oldValue, newValue, reason } = await request.json();
  if (!dishId || !field) {
    return NextResponse.json({ error: "字段不完整" }, { status: 400 });
  }

  const correction = await prisma.correction.create({
    data: {
      dishId,
      userId: session.user.id,
      field,
      oldValue: oldValue ?? "",
      newValue: newValue ?? "",
      reason: reason ?? null,
    },
  });
  return NextResponse.json(correction);
}
