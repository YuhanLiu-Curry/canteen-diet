import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const canteens = await prisma.canteen.findMany({
    include: {
      stalls: {
        include: {
          dishes: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true, kcal: true, proteinG: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(canteens);
}
