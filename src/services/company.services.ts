import { httpClient } from "@/lib/axios/httpClient";

export const CompanyService = {
  getAllCompanies: async () => {
    return await httpClient.get("/companies/all");
  },
  changeCompanyStatus: async ({ companyId, status }: { companyId: string, status: string }) => {
    return await httpClient.patch(`/companies/${companyId}/status`, { status });
  }
};