import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Link } from "../../../models/page.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

let uniqueId = 0;

@Component({
  selector: "app-link-edit",
  templateUrl: "./link-edit.html",
})
export class LinkEditComponent implements OnInit {
  private logger: Logger;
  @Input() link: Link;
  @Output() delete: EventEmitter<Link> = new EventEmitter();

  faClose = faClose;

  constructor(
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LinkEditComponent, NgxLoggerLevel.OFF);
  }

  uniqueIdFor(prefix: string) {
    const uniqueIdFor = `${prefix}-${uniqueId}`;
    this.logger.info("uniqueIdFor:", prefix, "returning:", uniqueIdFor);
    return uniqueIdFor;
  }

  ngOnInit() {
    uniqueId = uniqueId++;
    this.logger.debug("constructed", uniqueId, "instance with link:", this.link);
  }

  deleteLink() {
    this.delete.next(this.link);
  }
}
