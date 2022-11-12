import { Component, OnInit } from "@angular/core";
import { PageService } from "../../services/page.service";

@Component({
  selector: "app-contact-us-page",
  templateUrl: "./contact-us-page.component.html",
  styleUrls: ["./contact-us.component.sass"]
})
export class ContactUsPageComponent implements OnInit {

  constructor(private pageService: PageService) {
  }

  ngOnInit() {
    this.pageService.setTitle();
  }

}
