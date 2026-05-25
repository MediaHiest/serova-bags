import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const isFeatured = body.isFeatured;

  if (typeof isFeatured !== "boolean") {
    return jsonError("isFeatured must be a boolean", 400);
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isFeatured },
  });

  return jsonSuccess({ product: { id: product.id, isFeatured: product.isFeatured } });
}
