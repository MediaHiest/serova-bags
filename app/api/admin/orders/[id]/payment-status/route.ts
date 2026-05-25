import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { paymentStatusSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = paymentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const order = await prisma.order.update({
    where: { id },
    data: { paymentStatus: parsed.data.paymentStatus },
  });

  return jsonSuccess({ order: { id: order.id, paymentStatus: order.paymentStatus } });
}
