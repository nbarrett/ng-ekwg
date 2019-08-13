import { Component, Input, OnInit } from "@angular/core";
import { WalkDisplayService } from "../pages/walks/walk-display.service";
import { Walk } from "../models/walk.model";

@Component({
  selector: "app-panel-expander",
  templateUrl: "./panel-expander.component.html",
  styleUrls: ["./panel-expander.component.sass"]
})
export class PanelExpanderComponent implements OnInit {
  @Input()
  walk: Walk;
  @Input()
  expandable: boolean;
  @Input()
  expandEdits: boolean;
  @Input()
  collapsable: boolean;
  @Input()
  expandAction: string;
  @Input()
  collapseAction: string;

  constructor(private display: WalkDisplayService) {
  }

  ngOnInit() {
    if (!this.collapseAction) {
      this.collapseAction = "collapse";
    }
    if (!this.expandAction) {
      this.expandAction = "expand";
    }
  }

  expand() {
    if (this.expandEdits) {
      this.display.editWalkFullscreen(this.walk);
    } else {
      this.display.toggleExpandedViewFor(this.walk);
    }
  }

  collapse() {
    this.display.toggleExpandedViewFor(this.walk);
  }
}
