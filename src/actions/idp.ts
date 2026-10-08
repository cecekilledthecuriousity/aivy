"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IDPStatus, Role } from "@prisma/client";
import { canAccessSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateIDPStatusAction(idpId: string, status: IDPStatus) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const idpItem = await prisma.iDPItem.findUnique({
    where: { id: idpId },
    include: { session: true },
  });

  if (!idpItem) {
    throw new Error("IDP item not found");
  }

  const user = session.user as any;
  const hasAccess = canAccessSession(
    { id: user.id, role: user.role as Role },
    idpItem.session
  );
  
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.iDPItem.update({
    where: { id: idpId },
    data: { status },
  });

  revalidatePath("/portal/my-evaluation");
  return updated;
}
