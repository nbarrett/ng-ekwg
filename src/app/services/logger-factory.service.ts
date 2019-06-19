import { Injectable } from "@angular/core";
import { CustomNGXLoggerService, NGXLogger, NgxLoggerLevel } from "ngx-logger";

@Injectable({
  providedIn: "root"
})

export class LoggerFactory {

  constructor(private customLogger: CustomNGXLoggerService) {
  }

  createLogger<T extends InstanceType<any>>(classRef: T): Logger {
    return new Logger(this.customLogger.create({level: NgxLoggerLevel.INFO}), classRef.name);
  }

}

export class Logger {
  constructor(private logger: NGXLogger, private className: string) {
  }

  info(...additional: any[]) {
    this.logger.info(this.className, ...additional);
  }

  debug(...additional: any[]) {
    this.logger.debug(this.className, ...additional);
  }

  error(...additional: any[]) {
    this.logger.error(this.className, ...additional);
  }

}
