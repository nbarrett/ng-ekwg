import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { LoginModalComponent } from "../pages/login/login-modal/login-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-login",
  template: ""
})
export class LoginComponent implements OnInit {
  private logger: Logger;

  constructor(private modalService: BsModalService,
              public route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginComponent, NgxLoggerLevel.OFF);
    this.logger.debug("constructed");
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.modalService.show(LoginModalComponent);
    });
  }

}
