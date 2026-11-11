export type Employee = {
  id: number;
  employeeNumber: string;
  name: string;
  country: string;
  countryName: string;
  department: string;
  departmentName: string;
  role: string;
  roleName: string;
  currency: string;
  period: string;
  salaryMinor: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
};
export type Catalog = {
  countries: { code: string; name: string }[];
  departments: { id: string; name: string }[];
  roles: { id: string; name: string }[];
  currencies: { code: string; precision: number }[];
};
export type EmployeePage = {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};
