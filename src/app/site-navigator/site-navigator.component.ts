import { Component } from "@angular/core";

@Component({
  selector: "app-site-navigator",
  templateUrl: "./site-navigator.component.html",
  styleUrls: ["./site-navigator.component.sass"]

})
export class SiteNavigatorComponent {

  public sites = [
    {href: "#", title: "EKWG", active: true},
    {href: "http://www.kentramblers.org.uk", title: "Kent Ramblers"},
    {href: "http://www.ramblers.org.uk/", title: "National Ramblers"}];
}
