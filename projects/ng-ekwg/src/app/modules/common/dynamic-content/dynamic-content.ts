import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faAdd, faMinusCircle, faPencil, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { View } from "../../../markdown-editor/markdown-editor.component";
import { AlertTarget } from "../../../models/alert-target.model";
import { AwsFileData } from "../../../models/aws-object.model";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentColumn, PageContentEditEvent, PageContentType } from "../../../models/content-text.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { cardClasses } from "../../../services/card-utils";
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
  selector: "app-dynamic-content",
  templateUrl: "./dynamic-content.html",
  styleUrls: ["./dynamic-content.sass"],
})
export class DynamicContentComponent implements OnInit {
  @Input()
  public anchor: string;
  private logger: Logger;
  public relativePath: string;
  public contentPath: string;
  public pageContent: PageContent;
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
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
  public editNameEnabled: true;
  public contentDescription: string;
  public queryCompleted = false;
  public pageContentEditEvents: PageContentEditEvent[] = [];
  constructor(
    public siteEditService: SiteEditService,
    public pageContentEditService: PageContentEditService,
    private memberResourcesReferenceData: MemberResourcesReferenceDataService,
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
    this.logger = loggerFactory.createLogger(DynamicContentComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.area = this.urlService.area();
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = this.pageService.contentPath(this.anchor);
      this.contentDescription = this.pageService.contentDescription(this.anchor);
      this.logger.debug("initialised with relativePath:", this.relativePath, "contentPath:", this.contentPath);
      this.pageTitle = this.pageService.pageSubtitle();
      this.logger.debug("Finding page content for " + this.contentPath);
      this.refreshPageContent();
      this.authService.authResponse().subscribe(() => this.refreshPageContent());
      this.broadcastService.on(NamedEventType.SAVE_PAGE_CONTENT, (namedEvent: NamedEvent<PageContent>) => {
        this.logger.info("event received:", namedEvent);
        if (namedEvent.data.id === this.pageContent.id) {
          this.savePageContent();
        }
      });
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
  }

  columnsFilteredForAccessLevel(columns: PageContentColumn[]) {
    return columns.filter(item => {
      const accessLevelData = this.memberResourcesReferenceData.accessLevelFor(item.accessLevel);
      return accessLevelData ? accessLevelData.filter() : true;
    });
  }

  pageContentFilteredForAccessLevel(pageContent: PageContent): PageContent {
    if (this.siteEditService.active()) {
      this.logger.info("pageContentFilteredForAccessLevel:siteEditService.active:pageContent unfiltered:", pageContent);
      return pageContent;
    } else {
      const filteredPageContent = {
        ...pageContent, rows: pageContent?.rows?.map(row => {
          const columns = this.columnsFilteredForAccessLevel(row.columns);
          return {...row, columns};
        }) || []
      };
      this.logger.info("pageContentFilteredForAccessLevel:filteredPageContent:", filteredPageContent);
      return filteredPageContent;
    }
  }

  private refreshPageContent() {
    this.logger.info("refreshPageContent for", this.contentPath);
    this.pageContentService.findByPath(this.contentPath)
      .then(pageContent => {
        if (pageContent) {
          this.logger.info("findByPath", this.contentPath, "returned:", pageContent);
          this.successfulPageContentReceived(pageContent);
        } else {
          this.pageContentService.findByPath(`${this.urlService.firstPathSegment()}#${this.anchor}`)
            .then(pageContent => {
              if (pageContent) {
                this.successfulPageContentReceived(pageContent);
              } else {
                this.notify.warning({
                  title: `Page not found`,
                  message: `The ${this.contentPath} page content was not found`
                });
              }
            });
        }
      }).catch(error => {
      this.logger.info("Page content error found for", this.contentPath, error);
      this.queryCompleted = true;
    });
  }

  private successfulPageContentReceived(pageContent: PageContent) {
    this.pageContent = this.pageContentFilteredForAccessLevel(pageContent);
    this.queryCompleted = true;
    if (pageContent) {
      this.logger.info("Page content found for", this.contentPath, "as:", pageContent);
    } else {
      this.logger.info("Page content not found for", this.contentPath, "pageContent:", this.pageContent);
      this.notify.warning({
        title: `Page not found`,
        message: `The ${this.contentPath} page content was not found`
      });
    }
  }

  slideClasses(columnCount: number | undefined) {
    return cardClasses(columnCount);
  }

  createContent() {
    this.pageContent = {
      path: this.contentPath,
      rows: [this.actions.defaultRowFor(PageContentType.TEXT)]
    };
    this.logger.info("this.pageContent:", this.pageContent);
  }

  public savePageContent() {
    this.pageContentService.createOrUpdate(this.pageContent)
      .then(response => this.pageContent = response);
  }

  public revertPageContent() {
    this.pageContentService.findByPath(this.pageContent.path)
      .then(response => this.pageContent = response);
  }

  public changeType($event: any) {
    this.logger.info("changeType:", $event);
  }

  public initialView(column: PageContentColumn): View {
    return column?.contentTextId ? View.VIEW : View.EDIT;
  }

  editImage(rowIndex: number, columnIndex: number) {
    this.pageContentEditEvents = this.pageContentEditService.handleEvent({path: this.pageContent.path, rowIndex, columnIndex, editActive: true}, this.pageContentEditEvents);
  }

  imageSource(rowIndex: number, columnIndex: number, imageSource: string) {
    return this.pageContentEditService.eventMatching(this.pageContentEditEvents, {path: this.pageContent.path, rowIndex, columnIndex})?.image || imageSource;
  }

  imageChanged(rowIndex: number, columnIndex: number, awsFileData: AwsFileData) {
    this.logger.info("imageChanged:", awsFileData);
    this.pageContentEditEvents = this.pageContentEditService.handleEvent({
      path: this.pageContent.path,
      rowIndex,
      columnIndex,
      editActive: true,
      image: awsFileData.image
    }, this.pageContentEditEvents);
  }

  editActive(rowIndex: number, columnIndex: number): boolean {
    const editActive = this.pageContentEditService.eventMatching(this.pageContentEditEvents, {columnIndex, rowIndex, path: this.pageContent.path})?.editActive;
    this.logger.debug("editActive:rowIndex:", rowIndex, "columnIndex:", columnIndex, "pageContentEditEvents:", this.pageContentEditEvents, "->", editActive);
    return editActive;
  }

  exitImageEdit(rowIndex: number, columnIndex: number) {
    this.logger.info("exitImageEdit:rowIndex:", rowIndex, "columnIndex:", columnIndex);
    this.pageContentEditEvents = this.pageContentEditService.handleEvent({path: this.pageContent.path, rowIndex, columnIndex, editActive: false}, this.pageContentEditEvents);
  }

  imagedSaved(rowIndex: number, columnIndex: number, column: PageContentColumn, awsFileData: AwsFileData) {
    this.logger.info("imagedSaved:", awsFileData, "setting imageSource for column", column, "to", awsFileData.awsFileName);
    column.imageSource = awsFileData.awsFileName;
    this.pageContentEditEvents = this.pageContentEditService.handleEvent({path: this.pageContent.path, rowIndex, columnIndex, editActive: false}, this.pageContentEditEvents);
  }

}
