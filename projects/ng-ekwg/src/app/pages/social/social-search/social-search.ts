import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faCopy, faSearch } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AlertTarget } from "../../../models/alert-target.model";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { FilterParameters } from "../../../models/social-events.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";

@Component({
  selector: "app-social-search",
  templateUrl: "./social-search.html",
  styleUrls: ["./social-search.sass"]
})
export class SocialSearchComponent implements OnInit {

  @Input()
  public notifyTarget: AlertTarget;

  @Input()
  filterParameters: FilterParameters;
  faSearch = faSearch;
  faCopy = faCopy;

  public showPagination = false;
  private logger: Logger;
  private searchChangeObservable: Subject<string>;
  public showSearch = true;

  constructor(private route: ActivatedRoute,
              private walksReferenceService: WalksReferenceService,
              private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService<any>,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialSearchComponent, NgxLoggerLevel.INFO);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit(): void {
    this.broadcastService.on(NamedEventType.SHOW_PAGINATION, (show: NamedEvent<boolean>) => {
      this.logger.info("showPagination:", show);
      return this.showPagination = show.data;
    });
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.APPLY_FILTER, searchTerm)));
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);

  }

  refreshSocialEvents(selectType: string) {
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.REFRESH, selectType));
  }

}
