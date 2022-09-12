import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AlertTarget } from "../../../models/alert-target.model";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { FilterParameters } from "../../../models/walk.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";

@Component({
  selector: "app-walks-search[notifyTarget]",
  templateUrl: "./walk-search.component.html"
})
export class WalkSearchComponent implements OnInit {
  @Input()
  notifyTarget: AlertTarget;

  @Input()
  filterParameters: FilterParameters;

  public currentWalkId: string;
  public showPagination = false;
  private logger: Logger;
  private searchChangeObservable: Subject<string>;

  constructor(private route: ActivatedRoute,
              private walksReferenceService: WalksReferenceService,
              private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService<any>,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkSearchComponent, NgxLoggerLevel.INFO);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.currentWalkId = paramMap.get("walk-id");
      this.logger.debug("walk-id from route params:", this.currentWalkId);
    });
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

  walksFilter() {
    return this.walksReferenceService.walksFilter
      .filter(item => item.adminOnly ? this.memberLoginService.allowWalkAdminEdits() : true);
  }

  refreshWalks(selectType: string) {
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.REFRESH, selectType));
  }

}
