import { Injectable } from "@angular/core";
import { CustomNGXLoggerService, NGXLogger, NgxLoggerLevel } from "ngx-logger";

export class Logger {
  constructor(private logger: NGXLogger, private className: string) {
  }

  private logPrefix() {
    return this.className + " -";
  }

  info(...additional: any[]) {
    this.logger.info(this.logPrefix(), ...additional);
  }

  debug(...additional: any[]) {
    this.logger.debug(this.logPrefix(), ...additional);
  }

  error(...additional: any[]) {
    this.logger.error(this.logPrefix(), ...additional);
  }

  warn(...additional: any[]) {
    this.logger.warn(this.logPrefix(), ...additional);
  }

}

@Injectable({
  providedIn: "root"
})

export class LoggerFactory {

  constructor(private customLogger: CustomNGXLoggerService) {
  }

  createLogger<T extends InstanceType<any>>(classRef: T, level: NgxLoggerLevel): Logger {
    return new Logger(this.customLogger.create({level}), classRef.name);
  }

}

