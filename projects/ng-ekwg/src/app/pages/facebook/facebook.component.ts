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
  pluginUrl: any;
  appId = "643977439755625";
  width = "570";
  height = "642";
  version = "v14.0";
  facebookGroupUrl = "https://www.facebook.com/eastkentwalking";
  facebookPagesUrl = "https://www.facebook.com/pages/East-Kent-Walking-Group/172849389464649";
  scriptSrcUrl = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&autoLogAppEvents=1&version=" + this.version + "&appId=" + this.appId;

  constructor(private urlService: UrlService,
              public dateUtils: DateUtilsService,
              private sanitiser: DomSanitizer,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FacebookComponent, NgxLoggerLevel.OFF);
  }

  parameters() {
    return [
      "href=" + this.facebookGroupUrl,
      "tabs=timeline",
      "width=" + this.width,
      "height=" + this.height,
      "small_header=false",
      "adapt_container_width=true",
      "hide_cover=false",
      "show_facepile=true",
      "appId=" + this.appId
    ].join("&");
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.pluginUrl = this.sanitiser.bypassSecurityTrustResourceUrl("https://www.facebook.com/plugins/page.php?" + this.parameters());
  }

}
