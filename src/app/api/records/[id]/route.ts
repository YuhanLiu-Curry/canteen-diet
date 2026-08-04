import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 删除记录（仅限当天、本人）
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const record = await prisma.mealRecord.findUnique({ where: { id } });
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (record.date.getTime() !== today.getTime()) {
    return NextResponse.json({ error: "只能删除当天记录" }, { status: 403 });
  }

  await prisma.mealRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
