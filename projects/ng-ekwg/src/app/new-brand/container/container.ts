import { Component } from "@angular/core";

@Component({
  selector: "app-container",
  templateUrl: "./container.html",
  styleUrls: ["../styles/style-1.css", "../styles/style-btn.css", "../styles/style-bg.css", "../styles/style-text.css", "../styles/style-list.css"]
})
export class ContainerComponent {
  public navBarToggled: boolean;

  toggleNavBar() {
    this.navBarToggled = !this.navBarToggled;
  }

  icon() {
    return this.navBarToggled ? "i-cross" : "i-menu";
  }
}
