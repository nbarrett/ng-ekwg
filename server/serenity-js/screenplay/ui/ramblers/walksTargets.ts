import { Target } from "@serenity-js/protractor";
import { by, ElementArrayFinder, ElementFinder } from "protractor";

export class WalksTargets {

  public static loginTab = Target.the("login tab")
    .located(by.css(".auth0-lock-tabs-current"));

  public static userName = Target.the("user name")
    .located(by.css("input[type=email][name=email]"));

  public static password = Target.the("password")
    .located(by.css("input[type=password][name=password]"));

  public static loginSubmitButton = Target.the("login submit button")
    .located(by.css(".auth0-label-submit"));

  public static createDropdown = Target.the("Create Menu dropdown")
    .located(by.id("walks_manager_create"));

  public static authHeader = Target.the("Auth Header Frame")
    .located(by.css(".auth0-lock-header-welcome"));

  public static itemsPerPagePopup = Target.the("items per page popup")
    .located(by.css("_lstPageSize-button > span.ui-selectmenu-status"));

  public static walkListviewTable = Target.the("items per page")
    .located(by.css("#views-form-ramled-all-walks-events-all-walks-events table tbody"));

  public static showAllWalks = Target.the("show all walks")
    .located(by.css("_lstPageSize-button > span.ui-selectmenu-status"));

  public static walkListviewTableRows = Target.all("ramblers walk table rows")
    .located(by.css("#views-form-ramled-all-walks-events-all-walks-events table tbody tr"));

  public static progressIndicator = Target.the("progress indicator")
    .located(by.css("#updateprogress.progress"));

  public static loaderIndicator = Target.the("loader indicator")
    .located(by.css("[src$='ajax-loader.gif']"));

  public static selectAll = Target.the("select all walks button")
    .located(by.css("th.select-all input"));

  public static deleteSelected = Target.the("delete selected walks button")
    .located(by.css("input[value=Delete][name=op]"));

  public static unPublishSelected = Target.the("Unpublish selected walks button")
    .located(by.css("input[value=UnPublish][name=op]"));

  public static publishSelected = Target.the("Publish selected walks button")
    .located(by.css("input[value=Publish][name=op]"));

  public static chooseFilesButton = Target.the("Choose Files button")
    .located(by.id("edit-walk-csv-upload"));

  public static uploadAWalksCSV = Target.the("Upload a walk CSV")
    .located(by.id("uploadWalkModal_open"));

  public static uploadWalksButton = Target.the("Upload walks")
    .located(by.id("edit-submit-upload"));

  public static executeActionButton = Target.the("Execute Action Button")
    .located(by.id("edit-submit"));

  public static cancelActionButton = Target.the("Cancel")
    .located(by.id("edit-cancel"));

  public static errorAlert = Target.the("Error Alert")
    .located(by.css(".alert-error"));

  public static successAlert = Target.the("Success Alert")
    .located(by.css(".alert-success"));

  public static alertMessage = Target.the("Alert Status Message")
    .located(by.css(".alert-status"));

  public static uploadErrorList = Target.all("Upload Error List Parent")
    .located(by.css(".alert-error .item-list ul"));

  public static uploadErrorSummary = Target.all("Upload result table rows")
    .located(by.css(".alert-error .item-list h3"));


  public static columnsForRow(result: ElementFinder): ElementArrayFinder {
    return result.all(by.css(".views-field-views-bulk-operations-bulk-form,.views-field-ramled-title-field,.views-field-field-date,.views-field-ram-content-moderation-views-field-states"));
  }

  public static hrefForRow(result: ElementFinder): ElementFinder {
    return result.element(by.css(".views-field-ramled-title-field a"));
  }

  public static checkboxSelector(rowIndex: number, date: string) {
    return Target.the(`Checkbox for ${date} walk`)
      .located(by.id("edit-views-bulk-operations-bulk-form-" + rowIndex));
  }
}
