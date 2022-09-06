import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { faCircleCheck, faEraser, faMagnifyingGlass, faPencil, faRemove, faSpinner } from "@fortawesome/free-solid-svg-icons";
import cloneDeep from "lodash-es/cloneDeep";
import isEmpty from "lodash-es/isEmpty";
import isEqual from "lodash-es/isEqual";
import pick from "lodash-es/pick";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { ContentText } from "../models/content-text.model";
import { BroadcastService } from "../services/broadcast-service";
import { ContentTextService } from "../services/content-text.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberLoginService } from "../services/member/member-login.service";
import { SiteEditService } from "../site-edit/site-edit.service";

export interface EditorState {
  editActive: boolean;
  preview: boolean;
  dataAction: DataAction;
}

export enum DataAction {
  QUERY = "query",
  SAVE = "save",
  REVERT = "revert",
  NONE = "none"
}

@Component({
  selector: "app-markdown-editor",
  templateUrl: "./markdown-editor.component.html",
  styleUrls: ["./markdown-editor.component.sass"]
})
export class MarkdownEditorComponent implements OnInit, OnChanges {
  private logger: Logger;
  private originalContent: ContentText;
  public editorState: EditorState;
  public editCaption: string;
  public previewCaption: string;
  public content: ContentText;
  private saveEnabled = false;

  @Input() data: ContentText;
  @Input() name: string;
  @Input() id: string;
  @Input() category: string;
  @Input() text: string;
  @Input() rows: number;
  @Input() editCaptionText: string;
  @Input() editNameEnabled: boolean;
  @Input() deleteEnabled: boolean;
  @Input() editInitiallyActive: boolean;
  @Input() previewInitiallyActive: boolean;
  @Input() description: string;
  @Output() saved: EventEmitter<ContentText> = new EventEmitter();
  private initialised: boolean;
  faSpinner = faSpinner;
  faMagnifyingGlass = faMagnifyingGlass;
  faPencil = faPencil;
  faCircleCheck = faCircleCheck;
  faRemove = faRemove;
  faEraser = faEraser;

  constructor(private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService,
              private contentTextService: ContentTextService,
              private changeDetectorRef: ChangeDetectorRef,
              private siteEditService: SiteEditService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MarkdownEditorComponent, NgxLoggerLevel.OFF);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialised) {
      this.logger.debug("changes were", changes);
      const textChange = changes?.text?.currentValue;
      if (textChange) {
        this.content.text = textChange;
        this.text = textChange;
        this.logger.debug("text is now", this.text);
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  ngOnInit() {
    this.logger.debug("ngOnInit", this.name || this.data);
    this.editCaption = "querying";
    this.previewCaption = "querying";
    this.editCaption = this.editCaptionText || "edit";
    this.editorState = {
      editActive: this.editInitiallyActive || this.siteEditService.active(),
      preview: this.previewInitiallyActive === undefined ? true : this.previewInitiallyActive,
      dataAction: DataAction.NONE
    };
    if (this.data) {
      const existingData: boolean = !!this.data.id;
      this.content = this.data;
      this.saveEnabled = true;
      this.logger.debug("editing:", this.content, "existingData:", existingData, "editorState:", this.editorState, "rows:", this.rows);
      this.editCaption = "edit";
      this.previewCaption = "preview";
      this.originalContent = cloneDeep(this.content);
      this.setDescription();
    } else if (this.text) {
      this.editCaptionText = this.editCaptionText || "edit";
      this.previewCaption = "preview";
      this.content = {name: this.name, text: this.text, category: this.category};
      this.originalContent = cloneDeep(this.content);
      this.logger.debug("editing injected content", this.content, "editorState:", this.editorState);
    } else {
      this.queryContent().then(() => {
        this.editCaptionText = this.editCaptionText || "edit";
        this.previewCaption = "preview";
        this.setDescription();
        this.changeDetectorRef.detectChanges();
      });
    }
    this.siteEditService.events.subscribe((item: NamedEvent) => {
      this.logger.debug(this.name, "editInitiallyActive", this.editInitiallyActive, "siteEditService:active", item);
      if (this.editInitiallyActive === undefined) {
        this.editorState.editActive = item.data;
      }
    });
    this.initialised = true;
  }

  private setDescription() {
    if (!this.description) {
      this.description = this.content.name;
    }
  }

  queryContent(): Promise<ContentText> {
    this.editorState.dataAction = DataAction.QUERY;
    this.logger.debug("querying content", this.name, "editorState:", this.editorState);
    if (this.name) {
      return this.contentTextService.findByName(this.name).then((content) => {
        if (isEmpty(content)) {
          this.content = {category: this.category, text: this.text, name: this.name};
        } else {
          this.content = content;
        }
        return this.apply(content);
      });
    } else if (this.id) {
      return this.contentTextService.getById(this.id).then((content) => {
        return this.apply(content);
      });
    }
  }

  private apply(content: ContentText) {
    this.saveEnabled = true;
    this.originalContent = cloneDeep(this.content);
    this.editorState.dataAction = DataAction.NONE;
    if (!this.rows) {
      this.rows = this.calculateRowsFrom(this.content);
    }
    this.logger.debug(this.name, "retrieved content:", this.content, "editor state:", this.editorState);
    return content;
  }

  revert(): void {
    this.logger.debug("reverting " + this.name, "content");
    this.content = cloneDeep(this.originalContent);
  }

  dirty(): boolean {
    const fields = ["name", "category", "text"];
    const isDirty = !isEqual(pick(this.content, fields), pick(this.originalContent, fields));
    this.logger.debug("data", this.content, "originalContent", this.originalContent, "isDirty ->", isDirty);
    return isDirty;
  }

  save(): Promise<ContentText> {
    if (this.saveEnabled && this.editorState.dataAction === DataAction.NONE) {
      this.editorState.dataAction = DataAction.SAVE;
      this.logger.debug("saving", this.name, "content", "this.editorState", this.editorState);
      return this.contentTextService.createOrUpdate(this.content).then((data) => {
          this.content = data;
          this.originalContent = cloneDeep(this.content);
          this.logger.debug(this.name, "content retrieved:", this.content);
          this.editorState.dataAction = DataAction.NONE;
          this.logger.debug("saved", this.content, "content", "this.editorState", this.editorState);
          this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MARKDOWN_CONTENT_SAVED, data));
          this.saved.emit(data);
          this.changeDetectorRef.detectChanges();
          return this.content;
        }
      );
    }
  }

  calculateRowsFrom(data: ContentText): number {
    const text = data?.text;
    const rows = text ? text?.split(/\r*\n/).length + 1 : 1;
    this.logger.debug("number of rows in text ", text, "->", rows);
    return Math.max(rows, 10);
  }

  preview(): void {
    this.editorState.preview = true;
  }

  edit(): void {
    if (this.editorState.editActive) {
      this.editorState.preview = false;
    }
  }

  saving(): boolean {
    return this.editorState.dataAction === DataAction.SAVE;
  }

  querying(): boolean {
    return this.editorState.dataAction === DataAction.QUERY;
  }

  reverting(): boolean {
    return this.editorState.dataAction === DataAction.REVERT;
  }

  delete() {
    this.contentTextService.delete(this.content).then((removed) => {
      this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MARKDOWN_CONTENT_DELETED, removed));
      this.changeDetectorRef.detectChanges();
    });
  }

  canDelete() {
    return this.deleteEnabled && this.content.id;
  }

  canSave() {
    return this.saveEnabled;
  }

  canEdit() {
    return this.content && this.editorState.editActive && !this.editorState.preview;
  }

  canPreview() {
    return this.content && (this.editorState.preview || !this.editorState.editActive);
  }

  changeText($event: any) {
    this.logger.debug(this.name, "changeText:", $event);
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MARKDOWN_CONTENT_CHANGED, this.content));
  }
}
