import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { KeyValue } from "../../../services/enums";
import { IconService } from "../../../services/icon-service/icon-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";


@Component({
  selector: "app-icon-examples",
  templateUrl: "./icon-examples.html",
  styleUrls: ["./icon-examples.sass"],
})

export class IconExamplesComponent implements OnInit {

  private logger: Logger;
  public filteredIcons: KeyValue[] = [];
  filter: string;

  constructor(
    public iconService: IconService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(IconExamplesComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.filteredIcons = [];
  }

  modelChanged(data: string) {
    this.logger.debug("modelChanged:", data);
    this.filteredIcons = this.iconService.iconArray.filter(item => item?.key?.toLowerCase().includes(data?.toLowerCase()));
  }

  change($event: Event) {
    this.logger.debug("changed:", $event);
  }
}
