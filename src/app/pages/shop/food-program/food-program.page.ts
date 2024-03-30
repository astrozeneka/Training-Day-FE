import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-food-program',
  templateUrl: './food-program.page.html',
  styleUrls: ['./food-program.page.scss'],
})
export class FoodProgramPage extends Shop implements OnInit{
  override subscriptionSlug:string = "food-program";
  override subscriptionLabel:string = "Programme alimentaire";

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
