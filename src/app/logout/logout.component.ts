import { Component, Inject, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, ParamMap } from "@angular/router";
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
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LogoutComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
        this.loggedInMemberService.logout();
        this.routerHistoryService.navigateBackToLastMainPage();
      }
    );
  }
}
