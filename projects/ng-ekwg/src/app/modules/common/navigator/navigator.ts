import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-navigator",
  templateUrl: "./navigator.html",
  styleUrls: ["./navigator.sass"]
})
export class NavigatorComponent implements OnInit {
  private logger: Logger;

  constructor(private broadcastService: BroadcastService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NavigatorComponent, NgxLoggerLevel.DEBUG);
  }

  public navBarToggled: boolean;

  toggleNavBar() {
    this.navBarToggled = !this.navBarToggled;
  }

  ngOnInit(): void {
    this.broadcastService.on(NamedEventType.MENU_TOGGLE, (event: NamedEvent) => {
      this.logger.info("menu toggled with event:", event);
      this.navBarToggled = event.data;
    });
  }

  icon() {
    return this.navBarToggled ? "i-cross" : "i-menu";
  }

}
