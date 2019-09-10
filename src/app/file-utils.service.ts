import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class FileUtilsService {

  constructor() { }

  basename(path) {
    return path.split(/[\\/]/).pop();
  }

}
