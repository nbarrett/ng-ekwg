import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberLoginService } from "../services/member-login.service";
import { RouterHistoryService } from "../services/router-history.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html"
})
export class LogoutComponent implements OnInit {
  private logger: Logger;

  constructor(private memberLoginService: MemberLoginService,
              private route: ActivatedRoute,
              private routerHistoryService: RouterHistoryService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LogoutComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
        this.memberLoginService.logout();
      }
    );
    this.memberLoginService.loginResponseObservable().subscribe(() => this.routerHistoryService.navigateBackToLastMainPage());
  }
}
