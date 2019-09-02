import { Component, Inject, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { BroadcastService } from "../services/broadcast-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { RouterHistoryService } from "../services/router-history.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html"
})
export class LogoutComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("LoggedInMemberService") private loggedInMemberService,
              private route: ActivatedRoute,
              private routerHistoryService: RouterHistoryService,
              private broadcastService: BroadcastService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LogoutComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
        this.loggedInMemberService.logout();
      }
    );
    this.broadcastService.on("memberLogoutComplete", () => this.routerHistoryService.navigateBackToLastMainPage());
  }
}
