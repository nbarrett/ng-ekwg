import { Injectable } from "@angular/core";
import { max } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { ImageTag, RECENT_PHOTOS } from "../models/content-metadata.model";
import { sortBy } from "./arrays";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ImageTagDataService {
  private logger: Logger;
  private tagSubjects = new ReplaySubject<ImageTag[]>();
  private imageTagData: ImageTag[] = [];
  private selectedSubject = new BehaviorSubject<ImageTag>(null);
  private selectedValue: ImageTag | number | string = 0;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ImageTagDataService, NgxLoggerLevel.OFF);
  }

  populateFrom(imageTagData: ImageTag[]) {
    this.logger.debug("populateFrom", imageTagData);
    this.imageTagData = [RECENT_PHOTOS].concat(imageTagData);
    const initialValue = this.selectedValue ? this.findTag(this.selectedValue) : RECENT_PHOTOS;
    this.logger.debug("setting initial value to", initialValue);
    this.selectedValue = initialValue;
    this.selectedSubject.next(initialValue);
    this.publishChanges();
  }

  imageTags(): Observable<ImageTag[]> {
    return this.tagSubjects.asObservable();
  }

  private publishChanges() {
    this.tagSubjects.next(this.imageTagData);
  }

  addTag(subject: string): ImageTag {
    const maxKey = max(this.imageTagData.map(item => item.key));
    const imageTag: ImageTag = {key: (isNaN(maxKey) ? 0 : maxKey) + 1, subject};
    this.imageTagData.push(imageTag);
    this.publishChanges();
    return imageTag;
  }

  asImageTags(keys: number[]): ImageTag[] {
    return this.imageTagsSorted().filter(tag => keys.includes(tag.key));
  }

  currentTag(): ImageTag {
    return this.findTag(this.selectedValue);
  }

  findTag(value: ImageTag | number | string): ImageTag {
    if (typeof value === "object") {
      return this.findTag(value.key);
    } else {
      return this.imageTagsSorted().find(item => item.key === +value || item.subject.toLowerCase() === value?.toString()?.toLowerCase());
    }
  }

  public imageTagsSorted(): ImageTag[] {
    const sorted = this.imageTagData.sort(sortBy("sortIndex", "subject"));
    this.logger.debug("imageTagsSorted:", sorted);
    return sorted;
  }

  isActive(tag: ImageTag): boolean {
    const selectedTag = this.findTag(this.selectedValue);
    const active = selectedTag?.key === tag?.key;
    this.logger.debug("selectedValue:", this.selectedValue, "selectedTag:", selectedTag, "query tag", tag, "-> active:", active);
    return active;
  }

  select(tagOrValue: ImageTag | number | string) {
    const tag = this.findTag(tagOrValue);
    this.logger.debug("selecting tagOrValue", tagOrValue, "found tag", tag);
    if (tag) {
      this.selectedSubject.next(tag);
      this.selectedValue = tag;
    } else {
      this.selectedValue = tagOrValue;
    }
  }

  selectedTag(): Observable<ImageTag> {
    return this.selectedSubject.asObservable();
  }

}
