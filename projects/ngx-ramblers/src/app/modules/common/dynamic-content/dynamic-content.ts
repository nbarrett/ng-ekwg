import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faAdd, faMinusCircle, faPencil, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { PageContent, PageContentEditEvent } from "../../../models/content-text.model";
import { BroadcastService } from "../../../services/broadcast-service";
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
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public pageTitle: string;
  faPencil = faPencil;
  faAdd = faAdd;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faSave = faSave;
  faUndo = faUndo;
  faTableCells = faTableCells;
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }];
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
    this.logger = loggerFactory.createLogger(DynamicContentComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = this.pageService.contentPath(this.anchor);
      this.contentDescription = this.pageService.contentDescription(this.anchor);
      this.logger.debug("initialised with relativePath:", this.relativePath, "contentPath:", this.contentPath);
      this.pageTitle = this.pageService.pageSubtitle();
      this.logger.debug("Finding page content for " + this.contentPath);
      this.refreshPageContent();
      this.authService.authResponse().subscribe(() => this.refreshPageContent());
    });
  }

  private refreshPageContent() {
    this.logger.info("refreshPageContent for", this.contentPath);
    this.pageContentService.findByPath(this.contentPath)
      .then(pageContent => {
        if (pageContent) {
          this.logger.info("findByPath", this.contentPath, "returned:", pageContent);
          this.pageContentReceived(pageContent);
        } else {
          this.pageContentService.findByPath(`${this.urlService.firstPathSegment()}#${this.anchor}`)
            .then(pageContent => {
              if (pageContent) {
                this.pageContentReceived(pageContent);
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

  private pageContentReceived(pageContent: PageContent) {
    this.pageContent = pageContent;
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

}
