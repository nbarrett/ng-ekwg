import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faMinusCircle, faPencil, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { View } from "../../../markdown-editor/markdown-editor.component";
import { AlertTarget } from "../../../models/alert-target.model";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentColumn, PageContentType } from "../../../models/content-text.model";
import { LoginResponse } from "../../../models/member.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { cardClasses } from "../../../services/card-utils";
import { enumKeyValues, KeyValue } from "../../../services/enums";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberResourcesReferenceDataService } from "../../../services/member/member-resources-reference-data.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";
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

  constructor(
    public siteEditService: SiteEditService,
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
    this.logger = loggerFactory.createLogger(DynamicContentComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.area = this.urlService.area();
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = this.pageService.contentPath(this.relativePath, this.anchor);
      this.contentDescription = this.pageService.contentDescription(this.relativePath);
      this.logger.debug("initialised with relativePath:", this.relativePath, "contentPath:", this.contentPath);
      this.pageTitle = this.pageService.pageTitle(this.relativePath || this.area);
      this.logger.debug("Finding page content for " + this.contentPath);
      this.refreshPageContent();
      this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.refreshPageContent());
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
    this.pageContentService.findByPath(this.contentPath)
      .then(pageContent => {
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
      }).catch(error => {
      this.logger.info("Page content error found for", this.contentPath, error);
      this.queryCompleted = true;
    });
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

}
