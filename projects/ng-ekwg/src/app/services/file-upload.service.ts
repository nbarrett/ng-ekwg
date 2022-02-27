import { Injectable } from "@angular/core";
import { FileUploader } from "ng2-file-upload";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: "root"
})
export class FileUploadService {

  constructor(private authService: AuthService) {
  }

  createUploaderFor(rootFolder: string): FileUploader {
    return new FileUploader({
      url: "/api/aws/s3/file-upload?root-folder=" + rootFolder,
      disableMultipart: false,
      autoUpload: true,
      parametersBeforeFiles: true,
      additionalParameter: {},
      authTokenHeader: "Authorization",
      authToken: `Bearer ${this.authService.authToken()}`,
      formatDataFunctionIsAsync: false,
    });
  }

}
