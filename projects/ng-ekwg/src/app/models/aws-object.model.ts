import { Dimensions } from "ngx-image-cropper";

export interface FileNameData {
  originalFileName?: string;
  awsFileName?: string;
  title?: string;
}

export interface AwsFileData {
  awsFileName?: string;
  file: File;
  image: string;
}

export interface AuditStatus {
  info
}

export interface AuditMessage {
  status: AuditStatus;
  message: string;
}

export interface AwsFileUploadResponse {
  response: {
    files: {},
    auditLog: AuditMessage[],
    awsInfo: {
      responseData: {
        ETag: string;
      },
      information: string;
    },
    fileNameData: {
      rootFolder: string;
      originalFileName: string;
      awsFileName: string;
    },
    uploadedFile: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      destination: string;
      filename: string;
      path: string;
      size: number
    }
  }
}

export interface ImageData {
  base64: string;
  image: HTMLImageElement;
  size: Dimensions;
}

export interface DescribedDimensions extends Dimensions {
  description?: string;
}
