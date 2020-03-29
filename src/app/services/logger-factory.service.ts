import { Injectable } from "@angular/core";
import { CustomNGXLoggerService, LoggerConfig, NGXLogger, NgxLoggerLevel } from "ngx-logger";

export class Logger {
  constructor(private logger: NGXLogger, private className: string) {
  }

  private logPrefix() {
    return this.className + " -";
  }

  info(...additional: any[]) {
    this.logger.info(this.logPrefix(), ...additional);
  }

  log(...additional: any[]) {
    this.logger.log(this.logPrefix(), ...additional);
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

  off(...additional: any[]) {
  }

}

@Injectable({
  providedIn: "root"
})

export class LoggerFactory {

  constructor(private customLogger: CustomNGXLoggerService) {
  }

  createLogger<T extends InstanceType<any>>(classRef: T, loggerConfig: NgxLoggerLevel | LoggerConfig): Logger {
    const config: LoggerConfig = this.isLoggerConfig(loggerConfig) ? {...loggerConfig, ...{serverLoggingUrl: "api/logs"}} : {level: loggerConfig};
    return new Logger(this.customLogger.create(config), classRef.name);
  }

  isLoggerConfig(config: NgxLoggerLevel | LoggerConfig): config is LoggerConfig {
    return (config as LoggerConfig).level !== undefined;
  }

}

