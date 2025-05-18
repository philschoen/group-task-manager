// app/services/team.server.ts
import { prisma } from "~/utils/db.server";

export async function createTeamWithMembers(
  userId: string,
  teamData: { name: string; description?: string },
  memberEmails: string[]
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the team with creator as admin
    const team = await tx.team.create({
      data: {
        name: teamData.name,
        description: teamData.description,
        members: {
          create: {
            userId: userId,
            role: "ADMIN",
          },
        },
      },
    });

    // 2. Find existing users by email
    const existingUsers = await tx.user.findMany({
      where: {
        email: { in: memberEmails }
      }
    });

    // 3. Add valid members
    await tx.teamMember.createMany({
      data: existingUsers.map(user => ({
        userId: user.id,
        teamId: team.id,
        role: "MEMBER",
      })),
      skipDuplicates: true,
    });

    // 4. Determine invalid emails
    const validEmails = existingUsers.map(u => u.email);
    const invalidEmails = memberEmails.filter(email => !validEmails.includes(email));

    return {
      team,
      invalidEmails
    };
  });
}