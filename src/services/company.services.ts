import { httpClient } from "@/lib/axios/httpClient";

export const CompanyService = {
  getAllCompanies: async () => {
    return await httpClient.get("/companies/all");
  },
  toggleCompanyStatus: async (companyId: string) => {
    return await httpClient.patch(`/companies/${companyId}/toggle-status`,{});
  }
};