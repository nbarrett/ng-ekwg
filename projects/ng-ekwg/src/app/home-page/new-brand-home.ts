import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
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

  constructor(private broadcastService: BroadcastService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NewBrandHomeComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.broadcastService.on(NamedEventType.IMAGE_CROP, (event: NamedEvent) => {
      this.logger.info("croppedImage:", event);
      this.croppedImage = event.data;
    });
  }

}
