import { Component, HostListener, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.sass"]
})
export class NavbarComponent implements OnInit {
  private logger: Logger;
  public navbarContentWithinCollapse: boolean;

  constructor(private broadcastService: BroadcastService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NavbarComponent, NgxLoggerLevel.OFF);
  }

  public navBarToggled: boolean;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const width = event.target.innerWidth;
    this.detectWidth(width);
  }

  private detectWidth(width: number) {
    this.navbarContentWithinCollapse = width < 980;
    this.logger.info("detectWidth:", width, "this.navbarContentWithinCollapse:", this.navbarContentWithinCollapse);
  }

  toggleNavBar() {
    this.navBarToggled = !this.navBarToggled;
  }

  ngOnInit(): void {
    this.broadcastService.on(NamedEventType.MENU_TOGGLE, (event: NamedEvent) => {
      this.logger.info("menu toggled with event:", event);
      this.navBarToggled = event.data;
    });
    this.detectWidth(window.innerWidth);
  }

  icon() {
    return this.navBarToggled ? "i-cross" : "i-menu";
  }

}
