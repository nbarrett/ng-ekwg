import { Inject, Injectable } from "@angular/core";
import first from "lodash-es/first";
import sortBy from "lodash-es/sortBy";
import { ContentText } from "../models/content-text.model";

@Injectable({
  providedIn: "root"
})
export class ContentTextService {

  constructor(@Inject("ContentTextService") private contentTextService) {
  }

  all(): Promise<ContentText[]> {
    return this.contentTextService.all();
  }

  forName(name): Promise<ContentText> {
    return this.contentTextService.query({name}, {limit: 1})
      .then(contentDocuments => first(contentDocuments));
  }

  forCategory(category): Promise<ContentText[]> {
    return this.contentTextService.query({category})
      .then(contentDocuments => sortBy(contentDocuments, "name"));
  }

  create(reference: any) {
    return new this.contentTextService(reference);
  }

}
