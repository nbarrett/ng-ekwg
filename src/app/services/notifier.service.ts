import { Logger, LoggerFactory } from "./logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertMessage, AlertTarget, AlertType } from "../models/alert-target.model";
import { Injectable } from "@angular/core";

const ALERT_ERROR: AlertType = {class: "alert-danger", icon: "glyphicon-exclamation-sign", failure: true};
const ALERT_WARNING: AlertType = {class: "alert-warning", icon: "glyphicon-info-sign"};
const ALERT_INFO: AlertType = {class: "alert-success", icon: "glyphicon-info-sign"};
const ALERT_SUCCESS: AlertType = {class: "alert-success", icon: "glyphicon-ok"};

@Injectable({
  providedIn: "root"
})

export class NotifierService {

  constructor(private loggerFactory: LoggerFactory) {
  }

  createAlertInstance(alertTarget: AlertTarget, level?: NgxLoggerLevel): AlertInstance {
    return new AlertInstance(alertTarget, level, this.loggerFactory);
  }

}

export class AlertInstance {
  private logger: Logger;

  constructor(private alertTarget: AlertTarget, level: NgxLoggerLevel, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NotifierService, level || NgxLoggerLevel.INFO);
    this.alertTarget.alertClass = ALERT_SUCCESS.class;
    this.alertTarget.alert = ALERT_SUCCESS;
  }

  setReady() {
    this.clearBusy();
    this.alertTarget.ready = true;
  }

  clearBusy() {
    this.logger.debug("clearing busy");
    this.alertTarget.busy = false;
  }

  setBusy() {
    this.logger.debug("setting busy");
    return this.alertTarget.busy = true;
  }

  showContactUs(state) {
    this.logger.debug("setting showContactUs", state);
    return this.alertTarget.showContactUs = state;
  }

  private isAlertMessage(message: AlertMessage | string): message is AlertMessage {
    return message && (message as AlertMessage).message !== undefined;
  }

  notifyAlertMessage(alertType: AlertType, message?: AlertMessage | string, append?: boolean, busy?: boolean) {

    const messageText = this.isAlertMessage(message) ? message.message : message;

    if (busy) {
      this.setBusy();
    }
    if (!append || alertType === ALERT_ERROR || !this.alertTarget.alertMessages) {
      this.alertTarget.alertMessages = [];
    }
    if (messageText) {
      this.alertTarget.alertMessages.push(messageText);
    }
    this.alertTarget.alertTitle = this.isAlertMessage(message) ? message.title : undefined;
    this.alertTarget.alert = alertType;
    this.alertTarget.alertClass = alertType.class;
    this.alertTarget.showAlert = this.alertTarget.alertMessages.length > 0;
    this.alertTarget.alertMessage = this.alertTarget.alertMessages.join(", ");
    if (alertType === ALERT_ERROR && this.isAlertMessage(message) && !message.continue) {
      this.logger.error("notifyAlertMessage:", "class =", alertType, "messageText =", messageText, "append =", append);
      this.clearBusy();
      throw message;
    } else {
      return this.logger.debug("notifyAlertMessage:", "class =", alertType, "messageText =",
        messageText, "alertMessages", this.alertTarget.alertMessages, "append =", append, "showAlert =", this.alertTarget.showAlert);
    }
  }

  hide() {
    this.notifyAlertMessage(ALERT_SUCCESS);
    this.clearBusy();
  }

  progress(message: AlertMessage | string, busy?: boolean) {
    return this.notifyAlertMessage(ALERT_INFO, message, false, busy);
  }

  success(message: AlertMessage | string, busy?: boolean) {
    return this.notifyAlertMessage(ALERT_SUCCESS, message, false, busy);
  }

  successWithAppend(message: AlertMessage | string, busy?: boolean) {
    return this.notifyAlertMessage(ALERT_SUCCESS, message, true, busy);
  }

  error(message: AlertMessage | string, append?: boolean, busy?: boolean) {
    return this.notifyAlertMessage(ALERT_ERROR, message, append, busy);
  }

  warning(message: AlertMessage | string, append?: boolean, busy?: boolean) {
    return this.notifyAlertMessage(ALERT_WARNING, message, append, busy);
  }

}
