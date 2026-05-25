import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.address.findFirst({
    where: { id, userId: session!.sub },
  });
  if (!existing) return jsonError("Address not found", 404);

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

  const address = await prisma.address.update({
    where: { id },
    data,
  });

  return jsonSuccess({ address });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.address.findFirst({
    where: { id, userId: session!.sub },
  });
  if (!existing) return jsonError("Address not found", 404);

  await prisma.address.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session!.sub },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return jsonSuccess({ message: "Address deleted" });
}
