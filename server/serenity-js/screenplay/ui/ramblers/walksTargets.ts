import { Target } from "@serenity-js/protractor";
import { by } from "protractor";
import { lpad } from "underscore.string";

const walksViewParent = "#layout_0_content_2_innerleft_2_tabWalks";

export class WalksTargets {

  public static chatWindow = Target.the("chat window")
    .located(by.id("launcher"));

  public static userName = Target.the("user name")
    .located(by.css("#layout_0_content_0_innerleft_1_txtUsername"));

  public static password = Target.the("password")
    .located(by.css("#layout_0_content_0_innerleft_1_txtPassword"));

  public static loginButton = Target.the("login button")
    .located(by.css("#layout_0_content_0_innerleft_1_btnLogin"));

  public static loginStatus = Target.the("login status")
    .located(by.css(".LoginOut"));

  public static walksAndEventsManagerButton = Target.the("Group walks and events manager button")
    .located(by.css("a[title='Group walks and events manager']"));

  public static itemsPerPagePopup = Target.the("items per page popup")
    .located(by.css(walksViewParent + "_lstPageSize-button > span.ui-selectmenu-status"));

  public static itemsPerPage = Target.the("items per page")
    .located(by.css(walksViewParent + "_lstPageSize"));

  public static showAllWalks = Target.the("show all walks")
    .located(by.css(walksViewParent + "_lstPageSize-button > span.ui-selectmenu-status"));

  public static walks = Target.all("ramblers walks")
    .located(by.css("[id^=layout_0_content_2_innerleft_2_tabWalks_rptResults_ctl].lbs-search-row"));

  public static walkIds = Target.the("ramblers walk Ids")
    .located(by.css("[style='display: none'"));

  public static walkColumns = Target.the("ramblers walk columns")
    .located(by.css("[class^='col-']"));

  public static progressIndicator = Target.the("progress indicator")
    .located(by.css(".lbs-progress-msg"));

  public static loaderIndicator = Target.the("loader indicator")
    .located(by.css("[src$='ajax-loader.gif']"));

  public static selectAll = Target.the("select all walks button")
    .located(by.css(walksViewParent + "_btnSelectAll"));

  public static clearAll = Target.the("clear all walks button")
    .located(by.css(walksViewParent + "_btnClearAllSelections"));

  public static deleteSelected = Target.the("delete selected walks button")
    .located(by.css(walksViewParent + "_btnDelete"));

  public static unPublishSelected = Target.the("unpublish selected walks button")
    .located(by.css(walksViewParent + "_btnUnpublishWalks"));

  public static publishSelected = Target.the("publish selected walks awaiting approval button")
    .located(by.css(walksViewParent + "_btnPublishSubmittedWalks"));

  public static chooseFilesButton = Target.the("Choose Files button")
    .located(by.css(walksViewParent + "_filUploadWalks"));

  public static uploadWalksButton = Target.the("CSV upload button")
    .located(by.css(walksViewParent + "_btnUploadWalks"));

  public static accordionUpload = Target.the("CSV file accordion expander")
    .located(by.css("#accordion-upload > h3 > a"));

  public static uploadResultTableRows = Target.all("Upload result table rows")
    .located(by.css(walksViewParent + "_pnlUploadResult tr"));

  public static uploadResultSummary = Target.the("Upload result summary")
    .located(by.css(walksViewParent + "_pnlUploadResult p"));

  public static checkboxSelector(rowIndex: number, date: string) {
    return Target.the("checkbox for " + date + " walk")
      .located(by.css(walksViewParent + "_rptResults_ctl" + lpad((rowIndex + 1).toString(), 2, "0") + "_chkSelected"));
  }
}
