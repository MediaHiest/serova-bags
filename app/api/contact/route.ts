import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { contactInquirySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = contactInquirySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const data = parsed.data;

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      subject: data.subject.trim(),
      message: data.message.trim(),
    },
  });

  return jsonSuccess({ inquiry: { id: inquiry.id } }, 201);
}
