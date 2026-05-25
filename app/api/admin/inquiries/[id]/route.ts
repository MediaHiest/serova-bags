import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { inquiryStatusSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });

  if (!inquiry) return jsonError("Inquiry not found", 404);

  if (inquiry.status === "NEW") {
    await prisma.contactInquiry.update({
      where: { id },
      data: { status: "READ" },
    });
    inquiry.status = "READ";
  }

  return jsonSuccess({ inquiry });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!existing) return jsonError("Inquiry not found", 404);

  const body = await request.json();
  const parsed = inquiryStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return jsonSuccess({ inquiry });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.contactInquiry.delete({ where: { id } });
  return jsonSuccess({ message: "Inquiry deleted" });
}
