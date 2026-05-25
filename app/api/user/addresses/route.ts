import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validation";

export async function GET() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const addresses = await prisma.address.findMany({
    where: { userId: session!.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return jsonSuccess({ addresses });
}

export async function POST(request: NextRequest) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session!.sub },
      data: { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId: session!.sub } });
  const address = await prisma.address.create({
    data: {
      ...data,
      userId: session!.sub,
      isDefault: data.isDefault ?? count === 0,
    },
  });

  return jsonSuccess({ address }, 201);
}
