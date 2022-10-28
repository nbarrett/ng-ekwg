import { Injectable } from "@angular/core";
import isUndefined from "lodash-es/isUndefined";
import { FileUploader } from "ng2-file-upload";
import { AuthService } from "../auth/auth.service";
import { S3_BASE_URL } from "../models/content-metadata.model";

@Injectable({
  providedIn: "root"
})
export class FileUploadService {

  constructor(private authService: AuthService) {
  }

  createUploaderFor(rootFolder: string, autoUpload?: boolean): FileUploader {
    return new FileUploader({
      url: `${S3_BASE_URL}/file-upload?root-folder=${rootFolder}`,
      disableMultipart: false,
      autoUpload: isUndefined(autoUpload) ? true : autoUpload,
      parametersBeforeFiles: true,
      additionalParameter: {},
      authTokenHeader: "Authorization",
      authToken: `Bearer ${this.authService.authToken()}`,
      formatDataFunctionIsAsync: false,
    });
  }

}
