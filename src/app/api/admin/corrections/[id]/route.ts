import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 审核纠错：通过则更新菜品数据并标记 verified
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!admin?.isAdmin) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await request.json();
  const correction = await prisma.correction.findUnique({ where: { id } });
  if (!correction) {
    return NextResponse.json({ error: "纠错不存在" }, { status: 404 });
  }

  if (action === "approve") {
    // 应用纠错到菜品数据
    if (correction.field === "existence") {
      await prisma.dish.update({
        where: { id: correction.dishId },
        data: { isActive: false, dataVersion: { increment: 1 } },
      });
    } else if (["kcal", "proteinG", "carbsG", "fatG"].includes(correction.field)) {
      const value = Number(correction.newValue);
      if (!isNaN(value)) {
        await prisma.dish.update({
          where: { id: correction.dishId },
          data: {
            [correction.field]: value,
            confidence: "verified",
            dataVersion: { increment: 1 },
          },
        });
      }
    }
    await prisma.correction.update({
      where: { id },
      data: { status: "approved" },
    });
  } else {
    await prisma.correction.update({
      where: { id },
      data: { status: "rejected" },
    });
  }

  return NextResponse.json({ ok: true });
}
