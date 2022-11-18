import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../auth/auth.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html"
})
export class LogoutComponent implements OnInit {
  private logger: Logger;

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LogoutComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
        this.authService.logout();
      }
    );
  }
}
