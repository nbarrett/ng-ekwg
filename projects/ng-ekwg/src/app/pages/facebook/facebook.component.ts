import { Component, HostListener, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import min from "lodash-es/min";
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
  maxWidth = 570;
  width = 0;
  height = 642;
  version = "v14.0";
  facebookGroupUrl = "https://www.facebook.com/eastkentwalking";
  facebookPagesUrl = "https://www.facebook.com/pages/East-Kent-Walking-Group/172849389464649";
  scriptSrcUrl = this.sanitiser.bypassSecurityTrustResourceUrl(`https://connect.facebook.net/en_GB/sdk.js#xfbml=1&autoLogAppEvents=1&version=${this.version}&appId=${this.appId}`);
  initialised: true;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const width = event?.target?.innerWidth;
    this.setWidth(width);
  }

  constructor(private urlService: UrlService,
              public dateUtils: DateUtilsService,
              private sanitiser: DomSanitizer,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FacebookComponent, NgxLoggerLevel.INFO);
  }

  private setWidth(width: number) {
    this.width = min([width, this.maxWidth]);
    this.logger.info("setWidth:window.innerWidth",window.innerWidth,"provided:", width, "setting:", this.width);
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
    if (window.innerWidth < 1200) {
      this.setWidth(420);
    } else {
      this.setWidth(570);
    }
    this.pluginUrl = this.sanitiser.bypassSecurityTrustResourceUrl("https://www.facebook.com/plugins/page.php?" + this.parameters());
  }

}
