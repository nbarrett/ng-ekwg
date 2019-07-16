import { Component, Inject, Input, OnInit } from "@angular/core";
import { SiteEditService } from "../site-edit/site-edit.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import clone from "lodash-es/clone";
import property from "lodash-es/property";

@Component({
  selector: "app-markdown-editor",
  templateUrl: "./markdown-editor.component.html",
  styleUrls: ["./markdown-editor.component.sass"]
})

export class MarkdownEditorComponent implements OnInit {

  @Input() name: string;
  @Input() description: string;

  public userEdits: any;
  private logger: Logger;
  private originalData: any;
  private data: any = {text: ""};

  constructor(@Inject("LoggedInMemberService") private loggedInMemberService,
              @Inject("ContentText") private contentText,
              private siteEditService: SiteEditService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MarkdownEditorComponent, NgxLoggerLevel.OFF);
    this.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};
  }

  previewActive() {
    return this.userEdits.preview;
  }

  editSiteActive() {
    const active = this.siteEditService.active();
    this.logger.debug(this.name, "site edit active:", active);
    return active;
  }

  populateContent(type?: string) {
    if (type) {
      this.userEdits[type + "InProgress"] = true;
    }
    this.contentText.forName(this.name).then((data) => {
      this.logger.info("populateContent", this.name, "content retrieved:", data);
      this.data = data;
      this.originalData = clone(data);
      if (type) {
        this.userEdits[type + "InProgress"] = false;
      }
    });
  }

  ngOnInit() {
    this.logger.info("initialising:", this.name, "content, editSite:", this.editSiteActive());
    if (!this.description) {
      this.description = this.name;
    }
    this.populateContent();
  }

  edit() {
    this.userEdits.preview = false;
  }

  revert() {
    this.logger.debug("reverting " + this.name, "content");
    this.data = clone(this.originalData);
  }

  dirty() {
    const dirty = this.data && this.originalData && (this.data.text !== this.originalData.text);
    this.logger.debug(this.name, "dirty ->", dirty);
    return dirty;
  }

  save() {
    this.userEdits.saveInProgress = true;
    this.logger.info("saving", this.name, "content");
    this.data.$saveOrUpdate().then((data) => {
        this.userEdits.saveInProgress = false;
        this.data = data;
        this.originalData = clone(data);
        this.logger.debug(this.name, "content retrieved:", data);
      }
    );
  }

  rows() {
    // @ts-ignore
    const text: string = property(["text"])(this.data);
    const rows = text ? text.split(/\r*\n/).length + 1 : 1;
    this.logger.debug("number of rows in text ", text, "->", rows);
    return Math.max(rows, 10);
  }

  preview() {
    this.logger.info("previewing " + this.name, "content");
    this.userEdits.preview = true;
  }

}
