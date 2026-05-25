import { NextRequest } from "next/server";
import { requireUser, jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.sub },
    include: { profile: true },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonSuccess({
    profile: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.profile?.gender,
      dateOfBirth: user.profile?.dateOfBirth,
      avatarUrl: user.profile?.avatarUrl,
    },
  });
}

export async function PUT(request: NextRequest) {
  const { error, user: session } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const { profileUpdateSchema } = await import("@/lib/validation");
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { fullName, phone, gender, dateOfBirth, avatarUrl } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session!.sub },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
      profile: {
        upsert: {
          create: {
            gender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            avatarUrl: avatarUrl || undefined,
          },
          update: {
            ...(gender !== undefined && { gender }),
            ...(dateOfBirth !== undefined && {
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            }),
            ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
          },
        },
      },
    },
    include: { profile: true },
  });

  return jsonSuccess({
    profile: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.profile?.gender,
      dateOfBirth: user.profile?.dateOfBirth,
      avatarUrl: user.profile?.avatarUrl,
    },
  });
}
