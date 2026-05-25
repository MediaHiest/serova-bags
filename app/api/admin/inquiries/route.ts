import { NextRequest } from "next/server";
import { requireAdmin, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();

  const where: Prisma.ContactInquiryWhereInput = {};

  if (status && ["NEW", "READ", "RESOLVED"].includes(status)) {
    where.status = status as "NEW" | "READ" | "RESOLVED";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const inquiries = await prisma.contactInquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess({ inquiries });
}
