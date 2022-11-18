import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
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

export enum View {
  EDIT = "edit",
  VIEW = "view"
}

export interface EditorState {
  view: View;
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
  public content: ContentText = {};
  private saveEnabled = false;

  @Input("editNameEnabled") set acceptChangesFrom(editNameEnabled: boolean) {
    this.logger.debug("editNameEnabled:", editNameEnabled);
    this.editNameEnabled = editNameEnabled;
  }

  @Input() data: ContentText;
  @Input() name: string;
  @Input() id: string;
  @Input() category: string;
  @Input() text: string;
  @Input() rows: number;
  @Input() actionCaptionSuffix: string;
  @Input() deleteEnabled: boolean;
  @Input() clearEnabled: boolean;
  @Input() initialView: View;
  @Input() description: string;
  @Output() saved: EventEmitter<ContentText> = new EventEmitter();
  private editNameEnabled: boolean;
  private initialised: boolean;
  faSpinner = faSpinner;
  faPencil = faPencil;
  faCircleCheck = faCircleCheck;
  faRemove = faRemove;
  faEraser = faEraser;

  constructor(private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService<ContentText>,
              private contentTextService: ContentTextService,
              private changeDetectorRef: ChangeDetectorRef,
              public siteEditService: SiteEditService,
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
    this.logger.info("ngOnInit:name", this.name, "data:", this.data, "description:", this.description);
    this.editorState = {
      view: this.initialView || View.VIEW,
      dataAction: DataAction.NONE
    };
    if (this.data) {
      const existingData: boolean = !!this.data.id;
      this.content = this.data;
      this.saveEnabled = true;
      this.logger.debug("editing:", this.content, "existingData:", existingData, "editorState:", this.editorState, "rows:", this.rows);
      this.originalContent = cloneDeep(this.content);
      this.setDescription();
    } else if (this.text) {
      this.content = {name: this.name, text: this.text, category: this.category};
      this.originalContent = cloneDeep(this.content);
      this.logger.debug("editing injected content", this.content, "editorState:", this.editorState);
    } else {
      this.queryContent().then(() => {
        this.setDescription();
        this.changeDetectorRef.detectChanges();
      });
    }
    this.siteEditService.events.subscribe((item: NamedEvent<boolean>) => {
      this.logger.info(this.name, "this.editorState.view", this.editorState.view, "siteEditService:event", item);
      this.editorState.view = item.data ? View.EDIT : View.VIEW;
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
    if (this.id) {
      this.logger.info("querying content for id:", this.id, "name:", this.name, "category:", this.category, "editorState:", this.editorState, "id:",);
      return this.contentTextService.getById(this.id)
        .then((content) => {
          return this.apply(content);
        })
        .catch(response => {
          this.logger.error(response);
          return this.apply({});
        });
    } else if (this.name) {
      this.logger.info("querying content:name", this.name, "and category:", this.category, "editorState:", this.editorState, "id:", this.id);
      return this.contentTextService.findByNameAndCategory(this.name, this.category).then((content) => {
        return this.apply(content);
      });
    }
  }

  private apply(content: ContentText): ContentText {
    if (isEmpty(content)) {
      this.content = {category: this.category, text: this.text, name: this.name};
    } else {
      this.content = content;
    }
    this.saveEnabled = true;
    this.originalContent = cloneDeep(this.content);
    this.editorState.dataAction = DataAction.NONE;
    if (!this.rows) {
      this.rows = this.calculateRowsFrom(this.content);
    }
    this.logger.info(this.name, "retrieved content:", this.content, "editor state:", this.editorState);
    return this.content;
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
    this.editorState.view = View.VIEW;
  }

  toggleEdit(): void {
    this.logger.info("toggleEdit called");
    if (this.siteEditService.active() && this.editorState.dataAction !== DataAction.QUERY) {
      const priorState: View = this.editorState.view;
      if (priorState === View.VIEW) {
        this.editorState.view = View.EDIT;
      } else if (this.editorState.view === View.EDIT) {
        this.editorState.view = View.VIEW;
      }
      this.logger.info("toggleEdit: changing state from ", priorState, "to", this.editorState.view);
    }
  }

  nextActionCaption(): string {
    return this.editorState.dataAction === DataAction.QUERY ? "Querying" : this.editorState.view === View.VIEW ? this.captionFor(View.EDIT) : this.captionFor(View.VIEW);
  }

  private captionFor(view: View) {
    return view + (this.actionCaptionSuffix ? (" " + this.actionCaptionSuffix) : "");
  }

  saving(): boolean {
    return this.editorState.dataAction === DataAction.SAVE;
  }

  querying(): boolean {
    return this.editorState.dataAction === DataAction.QUERY;
  }

  icon(): IconDefinition {
    return this.editorState.dataAction === DataAction.QUERY ? faSpinner : this.editorState.view === View.VIEW ? faPencil : faMagnifyingGlass;
  }

  tooltip(): string {
    const prefix = this.editorState.dataAction === DataAction.QUERY ? "Querying" : this.editorState.view === View.VIEW ? "Edit" : "Preview";
    return prefix + " content for " + this.description;
  }

  reverting(): boolean {
    return this.editorState.dataAction === DataAction.REVERT;
  }

  clear() {
    delete this.content.id;
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

  canClear() {
    return this.clearEnabled && this.content.id;
  }

  canSave() {
    return this.saveEnabled;
  }

  changeText($event: any) {
    this.logger.debug(this.name, "changeText:", $event);
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MARKDOWN_CONTENT_CHANGED, this.content));
  }

}
