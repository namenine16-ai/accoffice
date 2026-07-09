export interface WorkflowTask {
  id: number;
  month: number;
  year: number;
  status: string;
  progress: number;
  deadline: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  priority: string;
  remarks: string | null;
  note: string | null;
  receiveDoc: boolean;
  vat: boolean;
  pnd1: boolean;
  pnd3: boolean;
  pnd53: boolean;
  sso: boolean;
  closing: boolean;
  customer: {
    id: number;
    companyName: string;
  };
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    position: string | null;
  } | null;
}
