export interface RamblersUploadAudit {
  auditTime: number;
  fileName: string;
  type: string;
  status: string;
  message: string;

  $id?(): any;
}
