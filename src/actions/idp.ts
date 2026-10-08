"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IDPStatus, Role } from "@prisma/client";

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
  const isEmployee = idpItem.session.employeeId === user.id;
  const isEvaluator = idpItem.session.evaluatorId === user.id;
  const isAdmin = user.role === Role.HR_ADMIN;

  if (!isEmployee && !isEvaluator && !isAdmin) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.iDPItem.update({
    where: { id: idpId },
    data: { status },
  });

  return updated;
}
