import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import kebabCase from "lodash-es/kebabCase";
import { NgxLoggerLevel } from "ngx-logger";
import { TagData, TagifySettings } from "ngx-tagify";
import { ReplaySubject } from "rxjs";
import { ImageTag, RECENT_PHOTOS } from "../../models/content-metadata.model";
import { ImageTagDataService } from "../../services/image-tag-data-service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";

@Component({
  selector: "app-tag-editor",
  styleUrls: ["./tag-editor.component.sass"],
  template: `
    <label [for]="label()">Image Tags</label>
    <tagify [(ngModel)]="editableTags"
            inputClass="round-small"
            [id]="label()"
            [settings]="settings"
            [whitelist]="tagLookups"
            [readonly]="readonly"
            (add)="onAdd($event)"
            (remove)="onRemove($event)">
    </tagify>
  `
})

export class TagEditorComponent implements OnInit {
  @Input() text: string;
  @Input() tags: number[];
  @Output() tagsChange: EventEmitter<ImageTag[]> = new EventEmitter();

  editableTags: TagData[] = [];
  settings: TagifySettings = {
    placeholder: "Click to select",
    blacklist: [RECENT_PHOTOS.subject],
    dropdown: {
      maxItems: 20,
      classname: "tags-look",
      enabled: 0,
      closeOnSelect: false
    },
    callbacks: {
      click: (event) => {
        this.logger.debug("clicked", event.detail);
      }
    }
  };
  tagLookups: ReplaySubject<TagData[]> = new ReplaySubject<TagData[]>();
  readonly = false;
  private logger: Logger;

  constructor(private imageTagData: ImageTagDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(TagEditorComponent, NgxLoggerLevel.OFF);
  }

  label(): string {
    return "image-tags-" + kebabCase(this.text);
  }

  ngOnInit() {
    if (!this.tags) {
      this.tags = [];
    }
    this.logger.debug("created tags for", this.text, this.tags);
    this.imageTagData.imageTags().subscribe(data => this.populateData(data));
  }

  private populateData(imageTags: ImageTag[]) {
    const tagData: TagData[] = imageTags.filter(item => item.key !== RECENT_PHOTOS.key).map(item => ({key: item.key, value: item.subject}));
    this.logger.debug("refreshed tag lookups with:", imageTags, "transformed to tagData:", tagData);
    this.tagLookups.next(tagData);
    this.editableTags = this?.tags?.map(tag => ({value: this.imageTagData.findTag(tag)?.subject}));
  }

  onAdd(data) {
    const tagData: TagData = data.added;
    if (!tagData.key) {
      const newImage: ImageTag = this.imageTagData.addTag(tagData.value);
      this.tags.push(newImage.key);
      this.logger.info("adding new Image tag", newImage);
    } else {
      this.tags.push(tagData.key);
      this.logger.debug("adding existing Image tag", tagData);
    }
    this.tagsChange.emit(this.imageTagData.asImageTags(this.tags));
  }

  onRemove(data: TagData[]) {
    const stories = this.imageTagData.asImageTags(data.map(item => item.key));
    this.logger.debug("onRemove tag data", data, "stories", stories);
    this.tagsChange.emit(stories);
  }

}
