import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxLoggerLevel } from "ngx-logger";
import { InstagramMediaPost } from "../../models/instagram.model";
import { DateUtilsService } from "../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-facebook",
  templateUrl: "./facebook.component.html",
  styleUrls: ["./facebook.component.sass"]
})
export class FacebookComponent implements OnInit {
  private logger: Logger;
  public recentMedia: InstagramMediaPost[];
  url: any;
  width = "560";
  height = "612";
  facebookUrl = "https://www.facebook.com/eastkentwalking";
  facebookPagesUrl = "https://www.facebook.com/pages/East-Kent-Walking-Group/172849389464649";

  constructor(private urlService: UrlService,
              public dateUtils: DateUtilsService,
              private sanitiser: DomSanitizer,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FacebookComponent, NgxLoggerLevel.OFF);
  }

  parameters() {
    return [
      "href=" + this.facebookUrl,
      "tabs=timeline&width=" + this.width + "&height=" + this.height,
      "small_header=false",
      "adapt_container_width=true",
      "hide_cover=false",
      "show_facepile=true",
      "appId=643977439755625"
    ].join("&");
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.url = this.sanitiser.bypassSecurityTrustResourceUrl("https://www.facebook.com/plugins/page.php?" + this.parameters());
  }

  dimensions() {
    return `width: ${this.width}; height: ${this.height};`;
  }
}
