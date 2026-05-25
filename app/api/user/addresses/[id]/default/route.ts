import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(_request: Request, { params }: Params) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.address.findFirst({
    where: { id, userId: session!.sub },
  });
  if (!existing) return jsonError("Address not found", 404);

  await prisma.address.updateMany({
    where: { userId: session!.sub },
    data: { isDefault: false },
  });

  const address = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  return jsonSuccess({ address });
}
