import { httpClient } from "@/lib/axios/httpClient";
import { ProjectRole } from "@/types/enums.types";

export const ProjectMemberService = {
  // ✅ GET members
  getProjectMembers: async (projectId: string) => {
    const res = await httpClient.get(`/project-members/project/${projectId}`);
    return res;

  },

  // ✅ ADD member (this one was already correct)
  addMember: async (data: {
    projectId: string;
    userId: string;
    projectRole: ProjectRole;
  }) => {
    const res = await httpClient.post("/project-members", data);
    return res;
  },

  // ✅ UPDATE role
  updateMemberRole: async ({
    projectId,
    userId,
    projectRole,
  }: {
    projectId: string;
    userId: string;
    projectRole: ProjectRole;
  }) => {
    const res = await httpClient.patch(
      `/project-members/project/${projectId}/user/${userId}/role`,
      { projectRole }
    );
    return res;
  },

  // ✅ REMOVE member
  removeMember: async ({
    projectId,
    userId,
  }: {
    projectId: string;
    userId: string;
  }) => {
    const res = await httpClient.delete(
      `/project-members/project/${projectId}/user/${userId}`
    );
    return res;
  },
};