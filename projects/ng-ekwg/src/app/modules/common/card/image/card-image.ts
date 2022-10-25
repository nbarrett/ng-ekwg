import { Component, Input, OnInit } from "@angular/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faImage, faSearch } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { ImageType } from "../../../../models/content-text.model";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { UrlService } from "../../../../services/url.service";

@Component({
  selector: "app-card-image",
  templateUrl: "./card-image.html",
  styleUrls: ["./card-image.sass"]
})
export class CardImageComponent implements OnInit {
  private logger: Logger;
  faImage = faImage;

  constructor(public urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CardImageComponent, NgxLoggerLevel.INFO);
  }

  @Input()
  public imageType: ImageType;
  @Input()
  public imageSource: string;
  @Input()
  public imageLink: string;
  @Input()
  public icon: IconProp;

  faSearch = faSearch;

  cardShouldHaveImage(): boolean {
    return (!this.imageType || this.imageType === ImageType.IMAGE) && !!this.imageSource;
  }

  cardShouldHaveIcon(): boolean {
    return this.imageType === ImageType.ICON && !!this.icon;
  }

  cardMissingImage(): boolean {
    return this.imageType === ImageType.IMAGE && !this.imageSource;
  }

  ngOnInit() {
    this.logger.info("ngOnInit:imageSource", this.imageSource, "imageLink:", this.imageLink, "icon:", this.icon);
  }

  hrefUrl() {
    const url = this.imageLink.startsWith("http") ? this.imageLink : null;
    this.logger.info("hrefUrl:imageLink", this.imageLink, "url:", url);
    return url;
  }
}
