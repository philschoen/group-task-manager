import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { TeamMembersSidebar } from "~/components/TeamMembersSidebar";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Response("Team not found", { status: 404 });
  }

  return Response.json({ members: team.members, currentUserId: userId });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "addMember") {
    const email = formData.get("email")?.toString().trim();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    const newUser = await prisma.user.findUnique({ where: { email } });
    if (!newUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: newUser.id,
          teamId: params.id!,
        },
      },
    });
    if (existingMember) {
      return Response.json({ error: "User is already a member of the team." }, { status: 400 });
    }

    await prisma.teamMember.create({
      data: {
        userId: newUser.id,
        teamId: params.id!,
        role: "MEMBER",
      },
    });

    return Response.json({ memberAdded: true });
  }

  if (actionType === "removeMember") {
    const removeUserId = formData.get("userId")?.toString();
    if (!removeUserId) return Response.json({ error: "No user specified" }, { status: 400 });

    // Only allow admins to remove members
    const adminMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: params.id!,
        },
      },
    });
    if (!adminMember || adminMember.role !== "ADMIN") {
      return Response.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    if (removeUserId === userId) {
      return Response.json({ error: "You cannot remove yourself" }, { status: 400 });
    }

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: removeUserId,
          teamId: params.id!,
        },
      },
    });

    return Response.json({ memberRemoved: true });
  }

  return null;
}

export default function TeamMembersRoute() {
  const { members, currentUserId } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    memberAdded?: boolean;
    memberRemoved?: boolean;
    error?: string;
  }>();
  const navigation = useNavigation();

  const [editMembers, setEditMembers] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Find current user's role
  const currentUserRole = members.find((m: any) => m.user.id === currentUserId)?.role;

  useEffect(() => {
    if (actionData?.memberAdded) {
      setMemberEmail("");
      setAddMemberError(null);
    } else if (actionData?.error) {
      setAddMemberError(actionData.error);
    }
  }, [actionData]);

  return (
    <TeamMembersSidebar
      team={{ members }}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      editMembers={editMembers}
      setEditMembers={setEditMembers}
      memberEmail={memberEmail}
      setMemberEmail={setMemberEmail}
      addMemberError={addMemberError}
    />
  );
}