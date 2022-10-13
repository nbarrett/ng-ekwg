import { Component, Input, OnInit } from "@angular/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faImage, faSearch } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";

@Component({
  selector: "app-card-image",
  templateUrl: "./card-image.html",
  styleUrls: ["./card-image.sass"]
})
export class CardImageComponent implements OnInit {
  private logger: Logger;
  faImage= faImage;
  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CardImageComponent, NgxLoggerLevel.OFF);
  }

  @Input()
  public imageSource: string;
  @Input()
  public imageLink: string;
  @Input()
  public icon: IconProp;

  faSearch = faSearch;

  ngOnInit() {
  }

}
