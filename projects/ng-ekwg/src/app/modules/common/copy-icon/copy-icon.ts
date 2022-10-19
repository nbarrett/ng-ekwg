import { Component, Input, OnInit } from "@angular/core";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { TooltipDirective } from "ngx-bootstrap/tooltip";
import { NgxLoggerLevel } from "ngx-logger";
import { ClipboardService } from "../../../services/clipboard.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-copy-icon",
  templateUrl: "./copy-icon.html",
  styleUrls: ["./copy-icon.sass"],
})

export class CopyIconComponent implements OnInit {
  @Input()
  elementName: string;
  @Input()
  value: string;
  @Input()
  icon: IconDefinition;

  faCopy: IconDefinition = faCopy;
  private logger: Logger;
  public tooltipPreCopy: string;
  public tooltipPostCopy: string;
  public copied: boolean;

  constructor(
    private clipboardService: ClipboardService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CopyIconComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("initialised with elementName", this.elementName, "value:", this.value);
    this.tooltipPreCopy = `Copy ${this.elementName} to clipboard`;
    this.tooltipPostCopy = `${this.elementName} has been copied to clipboard!`;
    this.icon = this.icon || faCopy;
  }

  copyToClipboard(text: string) {
    this.clipboardService.copyToClipboard(text);
    this.copied = true;
  }

  justCopied(): boolean {
    return this.copied && this.clipboardService.clipboardText() === this.value;
  }

  hide(preClick: TooltipDirective, postClick: TooltipDirective) {
    this.logger.debug("hiding both tooltips", preClick, postClick);
    postClick.hide();
    preClick.hide();
  }
}
