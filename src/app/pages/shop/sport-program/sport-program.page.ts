import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-sport-program',
  templateUrl: './sport-program.page.html',
  styleUrls: ['./sport-program.page.scss'],
})
export class SportProgramPage extends Shop implements OnInit {
  override subscriptionSlug:string = "sport-program";
  override subscriptionLabel:string = "Programme sportif";

  constructor(
    contentService: ContentService,
    router: Router,
    feedbackService: FeedbackService
  ) {
    super(contentService, router, feedbackService);
  }

  ngOnInit() {
  }

}
