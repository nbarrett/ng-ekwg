import { Component, Input, OnInit } from "@angular/core";
import { range } from "lodash-es";
import first from "lodash-es/first";
import { NgxLoggerLevel } from "ngx-logger";
import { BannerImageItem } from "../../models/banner-configuration.model";
import { Image, Images, SystemConfigResponse } from "../../models/system.model";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { StringUtilsService } from "../../services/string-utils.service";
import { SystemConfigService } from "../../services/system/system-config.service";

@Component({
  selector: "app-banner-image-selector",
  template: `
    <div class="row" *ngIf="bannerImageItem">
      <div class="col-md-12">
        <h4>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input"
                   [(ngModel)]="bannerImageItem.show"
                   type="checkbox"
                   id="include-{{imageTypeDescription}}">
            <label class="custom-control-label"
                   for="include-{{imageTypeDescription}}">{{imageTypeDescription}}</label>
          </div>
        </h4>
        <select [compareWith]="imageComparer" class="form-control input-sm"
                id="selected-logo-{{imageTypeDescription}}"
                [(ngModel)]="bannerImageItem.image">
          <option *ngFor="let image of images?.images"
                  [ngValue]="image">{{image.originalFileName}}</option>
        </select>
      </div>
    </div>
    <div class="row" *ngIf="bannerImageItem">
      <div [class]="propertyClass" *ngIf="configurePadding">
        <label>Padding:</label>
        <input [(ngModel)]="bannerImageItem.image.padding"
               type="number" class="form-control input-sm">
      </div>
      <div [class]="propertyClass" *ngIf="configureFontSize">
        <label>Font Size:</label>
        <input [(ngModel)]="bannerImageItem.fontSize"
               type="number" class="form-control input-sm">
      </div>
      <div [class]="propertyClass" *ngIf="configureColumns">
        <label>Columns (1 - 12):</label>
        <select class="form-control input-sm ml-2"
                id="selected-logo-{{imageTypeDescription}}"
                [(ngModel)]="bannerImageItem.columns">
          <option *ngFor="let width of widths"
                  [ngValue]="width">{{width}}</option>
        </select>
      </div>
      <div [class]="propertyClass" *ngIf="configureWidth">
        <label>Width:</label>
        <input [(ngModel)]="bannerImageItem.image.width"
               type="number" class="form-control input-sm">
      </div>
    </div>
  `
})

export class BannerImageSelectorComponent implements OnInit {
  private logger: Logger;
  public images: Images;
  public widths: number[] = range(1, 13);
  public imageTypeDescription: string;
  public propertyClass: string;
  public propertyConfigureCount = 0;

  constructor(private stringUtils: StringUtilsService,
              private systemConfigService: SystemConfigService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(BannerImageSelectorComponent, NgxLoggerLevel.OFF);
  }

  @Input() bannerImageItem: BannerImageItem;
  @Input() configureWidth: boolean;
  @Input() configureColumns: boolean;
  @Input() configureFontSize: boolean;
  @Input() configurePadding: boolean;

  ngOnInit() {
    this.logger.debug("ngOnInit:bannerImageItem:", this.bannerImageItem);
    if (this.configurePadding) {
      this.propertyConfigureCount++;
    }
    if (this.configureWidth) {
      this.propertyConfigureCount++;
    }
    if (this.configureColumns) {
      this.propertyConfigureCount++;
    }
    if (this.configureFontSize) {
      this.propertyConfigureCount++;
    }
    this.propertyClass = this.configurePropertyClass();
    this.systemConfigService.events()
      .subscribe((config: SystemConfigResponse) => {
        this.logger.info("this.bannerImageItem.bannerImageType", this.bannerImageItem?.bannerImageType, "config.system:", config.system);
        if (this.bannerImageItem?.bannerImageType) {
          this.images = config.system[this.bannerImageItem?.bannerImageType];
        }
        this.imageTypeDescription = this.stringUtils.asTitle(this.bannerImageItem?.bannerImageType.replace("s", ""));
        if (this.images?.images && !this?.bannerImageItem?.image) {
          this.bannerImageItem.image = first(this.images?.images);
        }
        this.logger.info("retrieved images", this.images, "bannerImageItem:", this.bannerImageItem);
      });
  }

  imageComparer(item1: Image, item2: Image): boolean {
    return item1?.awsFileName === item2?.awsFileName;
  }

  configurePropertyClass(): string {
    switch (this.propertyConfigureCount) {
      case 1:
        return "col-md-12";
      case 2:
        return "col-md-6";
      case 3:
        return "col-md-4";
      case 4:
        return "col-md-3";
    }

  }

}

