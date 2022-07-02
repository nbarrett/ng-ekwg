import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-navigator",
  templateUrl: "./navigator.html",
  styleUrls: ["./navigator.sass"]
})
export class NavigatorComponent implements OnInit {

  constructor() {
  }

  public navBarToggled: boolean;

  toggleNavBar() {
    this.navBarToggled = !this.navBarToggled;
  }

  icon() {
    return this.navBarToggled ? "i-cross" : "i-menu";
  }

  ngOnInit(): void {
  }

}
