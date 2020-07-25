import { Component, Input, OnInit } from "@angular/core";
import { FileUtilsService } from "../file-utils.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-notification-url",
  templateUrl: "./notification-url.component.html",
  styleUrls: ["./notification-url.component.sass"]
})
export class NotificationUrlComponent implements OnInit {

  @Input() name: string;
  @Input() text: string;
  @Input() subArea: string;
  @Input() id: string;
  @Input() area: string;
  @Input() target: string;

  public href: string;

  constructor(private uRLService: UrlService,
              private fileUtils: FileUtilsService) {
  }

  ngOnInit() {
    this.target = this.target || "_blank";
    this.href = this.uRLService.notificationHref({name: this.name, area: this.area, subArea: this.subArea, id: this.id});
    this.text = !this.text && this.name ? this.fileUtils.basename(this.name) : this.text || this.href;
  }

}
