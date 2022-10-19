import { Component, Input, OnInit } from "@angular/core";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { uniq } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { AwsFileData } from "../../../models/aws-object.model";
import { PageContent, PageContentColumn, PageContentRow } from "../../../models/content-text.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { IconService } from "../../../services/icon-service/icon-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberResourcesReferenceDataService } from "../../../services/member/member-resources-reference-data.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";
import { PageContentService } from "../../../services/page-content.service";
import { PageService } from "../../../services/page.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

@Component({
  selector: "app-card-editor",
  templateUrl: "./card-editor.html",
  styleUrls: ["./card-editor.sass"]
})
export class CardEditorComponent implements OnInit {
  @Input()
  public pageContent: PageContent;
  @Input()
  public column: PageContentColumn;
  @Input()
  public rowIndex: number;
  @Input()
  contentPath: string;
  @Input()
  relativePath: string;
  @Input()
  editNameEnabled: boolean;

  public row: PageContentRow;
  public awsFileData: AwsFileData;
  private logger: Logger;
  editActive: boolean;
  public faPencil = faPencil;
  public siteLinks: string[] = [];
  public imageType: string;
  public columnIndex: number;

  constructor(
    public memberResourcesReferenceData: MemberResourcesReferenceDataService,
    public iconService: IconService,
    private urlService: UrlService,
    private pageService: PageService,
    private stringUtils: StringUtilsService,
    public siteEditService: SiteEditService,
    public pageContentService: PageContentService,
    public actions: PageContentActionsService,
    private broadcastService: BroadcastService<PageContent>,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CardEditorComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.row = this.pageContent.rows[this.rowIndex];
    this.columnIndex = this.row.columns.indexOf(this.column);
    this.logger.info("ngOnInit:column", this.column, "this.row:", this.row);
    this.imageType = this.column.icon ? "icon" : "image";
  }

  imageSourceOrPreview(): string {
    return this.awsFileData?.image || this.column?.imageSource;
  }

  imageChanged(awsFileData: AwsFileData) {
    this.logger.info("imageChanged:", awsFileData);
    this.awsFileData = awsFileData;
  }

  exitImageEdit() {
    this.editActive = false;
    this.awsFileData = null;
  }

  editImage() {
    this.editActive = true;
    this.pageContentService.all().then(response => {
      this.siteLinks = uniq(response.map(item => item.path)).sort();
      this.logger.info("siteLinks:", this.siteLinks);
    });
  }

  imagedSaved(event: AwsFileData) {
    const imageSource = this.urlService.resourceRelativePathForAWSFileName(event.awsFileName);
    this.logger.info("imagedSaved:", event, "setting imageSource for column", this.column, "to", imageSource);
    this.column.imageSource = imageSource;
  }

  changeImageType(value: string) {
    this.imageType = value;
    this.logger.info("changeImageType:", value);
    if (value === "image") {
      this.column.icon = null;
    } else {
      this.column.imageSource = null;
    }
  }
}

