import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faAdd, faMinusCircle, faPencil, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { MarkdownEditorComponent } from "../../../markdown-editor/markdown-editor.component";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentEditEvent, PageContentType } from "../../../models/content-text.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { enumKeyValues, KeyValue } from "../../../services/enums";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberResourcesReferenceDataService } from "../../../services/member/member-resources-reference-data.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";
import { PageContentEditService } from "../../../services/page-content-edit.service";
import { PageContentService } from "../../../services/page-content.service";
import { PageService } from "../../../services/page.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

@Component({
  selector: "app-dynamic-content-site-edit",
  templateUrl: "./dynamic-content-site-edit.html",
  styleUrls: ["./dynamic-content.sass"],
})
export class DynamicContentSiteEditComponent implements OnInit {
  @Input()
  public pageContent: PageContent;
  @Input()
  public queryCompleted: boolean;
  @Input()
  public notify: AlertInstance;
  @Input()
  public contentDescription: string;
  @Input()
  public contentPath: string;

  private logger: Logger;
  public relativePath: string;
  public pageTitle: string;
  faPencil = faPencil;
  faAdd = faAdd;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faSave = faSave;
  faUndo = faUndo;
  faTableCells = faTableCells;
  public area: string;
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }];
  enumKeyValuesForPageContentType: KeyValue[] = enumKeyValues(PageContentType);
  public pageContentEditEvents: PageContentEditEvent[] = [];

  public unsavedMarkdownComponents: MarkdownEditorComponent[] = [];

  constructor(
    public siteEditService: SiteEditService,
    public pageContentEditService: PageContentEditService,
    public memberResourcesReferenceData: MemberResourcesReferenceDataService,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private urlService: UrlService,
    private numberUtils: NumberUtilsService,
    public stringUtils: StringUtilsService,
    private pageContentService: PageContentService,
    private pageService: PageService,
    private authService: AuthService,
    public actions: PageContentActionsService,
    private broadcastService: BroadcastService<PageContent>,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicContentSiteEditComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.broadcastService.on(NamedEventType.SAVE_PAGE_CONTENT, (namedEvent: NamedEvent<PageContent>) => {
      this.logger.info("event received:", namedEvent);
      if (namedEvent.data.id === this.pageContent.id) {
        this.savePageContent();
      }
    });
    this.broadcastService.on(NamedEventType.MARKDOWN_CONTENT_DELETED, (namedEvent: NamedEvent<PageContent>) => {
      this.logger.info("event received:", namedEvent);
      this.pageContent.rows.forEach(row => row.columns.forEach(column => {
        if (column.contentTextId === namedEvent?.data?.id) {
          this.logger.info("removing link to content " + namedEvent.data.id);
          delete column.contentTextId;
        }
      }));
      this.savePageContent();
    });
    this.broadcastService.on(NamedEventType.MARKDOWN_CONTENT_UNSAVED, (namedEvent: NamedEvent<MarkdownEditorComponent>) => {
      this.logger.info("event received:", namedEvent);
      if (!this.unsavedMarkdownComponents.includes(namedEvent.data)) {
        this.unsavedMarkdownComponents.push(namedEvent.data);
        this.logger.info("unsavedMarkdownComponents:", this.unsavedMarkdownComponents.map(item => item.content));
      }
    });
    this.broadcastService.on(NamedEventType.MARKDOWN_CONTENT_SYNCED, (namedEvent: NamedEvent<MarkdownEditorComponent>) => {
      this.logger.info("event received:", namedEvent);
      if (this.unsavedMarkdownComponents.includes(namedEvent.data)) {
        this.unsavedMarkdownComponents = this.unsavedMarkdownComponents.filter(item => item !== namedEvent.data);
        this.logger.info("unsavedMarkdownComponents:", this.unsavedMarkdownComponents.map(component => component.content));
      }
    });
  }

  createContent() {
    this.pageContent = {
      path: this.contentPath,
      rows: [this.actions.defaultRowFor(PageContentType.TEXT)]
    };
    this.logger.info("this.pageContent:", this.pageContent);
    this.queryCompleted = true;
  }

  public changeType($event: any) {
    this.logger.info("changeType:", $event);
  }

  public savePageContent() {
    this.logger.info("saving", this.unsavedMarkdownComponents.length, "markdown components before saving page content");

    Promise.all(this.unsavedMarkdownComponents.map(component => component.save())).then(() => {
      this.pageContentService.createOrUpdate(this.pageContent)
        .then(pageContent => this.pageContent = pageContent);
    });
  }

  public revertPageContent() {
    this.pageContentService.findByPath(this.pageContent.path)
      .then(pageContent => this.pageContent = pageContent);
  }

}
