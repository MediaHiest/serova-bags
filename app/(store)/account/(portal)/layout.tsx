import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountShell from "@/components/store/account/AccountShell";

export default async function AccountPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserFromCookie();
  if (!session) redirect("/account/login?redirect=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { fullName: true, email: true },
  });

  if (!user) redirect("/account/login");

  return (
    <AccountShell userName={user.fullName} userEmail={user.email}>
      {children}
    </AccountShell>
  );
}
