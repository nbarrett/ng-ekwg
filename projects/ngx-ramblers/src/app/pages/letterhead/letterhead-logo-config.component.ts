import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { LogoFileData, Logos, SystemConfigResponse } from "../../models/system.model";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { SystemConfigService } from "../../services/system/system-config.service";

@Component({
  selector: "app-letterhead-logo-config",
  template: `
    <div class="p-4">
      <h4>Logo</h4>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="selected-logo">Choose Logo:</label>
            <select class="form-control input-sm ml-2"
                    [(ngModel)]="logo"
                    (ngModelChange)="logoChange.next(logo)"
                    id="selected-logo">
              <option *ngFor="let logo of logos.images"
                      [ngValue]="logo">{{logo.originalFileName}}</option>
            </select>
          </div>
        </div>
        <ng-container *ngIf="logo">
          <div class="col-md-2">
            <label>Padding:</label>
            <input [(ngModel)]="logo.padding"
                   type="number" class="form-control input-sm">
          </div>
          <div class="col-md-2">
            <label>Width (1 - 12):</label>
            <input [ngModel]="logoWidth"
                   (change)="changeLogoWidth($event)"
                   type="number" class="form-control input-sm">
          </div>
          <div class="col-md-2">
            <label>Font Size:</label>
            <input [(ngModel)]="fontSize"
                   (change)="changeFontSize($event)"
                   type="number" class="form-control input-sm">
          </div>
        </ng-container>
      </div>
    </div>`
})

export class LetterheadLogoConfigComponent implements OnInit {
  private logger: Logger;
  public logos: Logos;
  public logo: LogoFileData;
  public logoWidth: number;
  public fontSize: number;

  constructor(private systemConfigService: SystemConfigService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LetterheadLogoConfigComponent, NgxLoggerLevel.OFF);
  }

  @Output() logoChange: EventEmitter<LogoFileData> = new EventEmitter();
  @Output() logoWidthChange: EventEmitter<number> = new EventEmitter();
  @Output() fontSizeChange: EventEmitter<number> = new EventEmitter();

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.systemConfigService.events()
      .subscribe((config: SystemConfigResponse) => {
        this.logos = config.system.logos;
        this.logo = this.logos.images[0];
        this.logoChange.next(this.logo);
        this.logoWidth = 6;
        this.fontSize = 34;
        this.logger.info("retrieved logos", this.logos, "this.logo:", this.logo);
      });
  }

  changeFontSize(event: any) {
    this.fontSizeChange.next(+event.target.value);
  }

  changeLogoWidth(event: any) {
    const value: number = +event.target.value;
    this.logger.info("changeLogoWidth:", value, typeof value);
    if (value < 1) {
      this.logoWidth = 1;
    } else if (value >= 12) {
      this.logoWidth = 12;
    } else {
      this.logoWidth = value;
    }
    event.target.value = this.logoWidth;
    this.logger.info("changeLogoWidth:value:", value, "logoWidth:", this.logoWidth);
    this.logoWidthChange.next(this.logoWidth);
  }
}

