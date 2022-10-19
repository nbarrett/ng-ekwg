import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { AwsFileData } from "../models/aws-object.model";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { BroadcastService } from "../services/broadcast-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-new-brand-home",
  templateUrl: "./new-brand-home.html",
  styleUrls: ["./new-brand-home.sass"]
})
export class NewBrandHomeComponent implements OnInit {

  croppedImage: any = "";
  private logger: Logger;

  constructor(private broadcastService: BroadcastService<any>,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NewBrandHomeComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit(): void {
    this.broadcastService.on(NamedEventType.IMAGE_CROP, (event: NamedEvent<any>) => {
      this.logger.info("croppedImage:", event);
      this.croppedImage = event.data;
    });
  }

  imageChanged(awsFileData: AwsFileData) {
    this.logger.info("awsFileData:", awsFileData);
    this.croppedImage = awsFileData.image
  }
}
