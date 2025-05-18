import { Form, useNavigation } from "@remix-run/react";
import { FaTimes, FaUserEdit } from "react-icons/fa";

export function TeamMembersSidebar({
  team,
  currentUserId,
  currentUserRole,
  editMembers,
  setEditMembers,
  memberEmail,
  setMemberEmail,
  addMemberError,
}: {
  team: any;
  currentUserId: string;
  currentUserRole: string;
  editMembers: boolean;
  setEditMembers: (v: boolean) => void;
  memberEmail: string;
  setMemberEmail: (v: string) => void;
  addMemberError: string | null;
}) {
  const navigation = useNavigation();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Team Members</h3>
        {currentUserRole === "ADMIN" && (
          <button
            type="button"
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded border transition
              ${editMembers
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"}
            `}
            onClick={() => setEditMembers(!editMembers)}
          >
            <FaUserEdit className="text-base" />
            {editMembers ? "Done" : "Edit"}
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {team.members.map((member: any) => (
          <li key={member.user.id} className="flex items-center">
            <div className="flex-1">
              <p className="font-medium">
                {member.user.name || member.user.email}
              </p>
              {member.user.name && (
                <p className="text-sm text-gray-500">{member.user.email}</p>
              )}
            </div>
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded font-semibold ml-2">
              {member.role}
            </span>
            {editMembers &&
              currentUserRole === "ADMIN" &&
              member.user.id !== currentUserId && (
                <Form method="post" className="ml-2">
                  <input type="hidden" name="userId" value={member.user.id} />
                  <button
                    type="submit"
                    name="_action"
                    value="removeMember"
                    className="p-1 rounded hover:bg-red-100 transition"
                    disabled={navigation.state !== "idle"}
                    title="Remove member"
                    onClick={(e) => {
                      if (
                        !confirm(
                          `Remove ${member.user.email} from the team?`
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FaTimes className="text-red-600 text-lg" />
                  </button>
                </Form>
              )}
          </li>
        ))}
      </ul>
      <hr className="my-4" />
      {/* Add Member Form */}
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-3">Add Member</h3>
        <Form method="post" className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border rounded text-sm"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            {addMemberError && (
              <p className="text-red-600 text-sm mt-1">{addMemberError}</p>
            )}
          </div>
          <button
            type="submit"
            name="_action"
            value="addMember"
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Add to Team
          </button>
        </Form>
      </div>
    </div>
  );
}