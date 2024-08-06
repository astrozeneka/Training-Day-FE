import {Component, Input, OnInit} from '@angular/core';
import {FeedbackOptions} from "../../feedback.service";
import {ModalController} from "@ionic/angular";

/*
    // EXAMPLE USAGE OF THE MODAL FEEDBACK

    this.feedbackService.registerNow(
      "Hello, this is a test message",
      "success",
      null,
      {
        type: 'modal',
        buttonText: 'OK',
        modalTitle: 'The title',
        modalContent: 'The content',
        modalImage: 'assets/logo-dark.png'
      }
    )

*/

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.scss'],
})
export class FeedbackModalComponent  implements OnInit {
  @Input() message: string
  @Input() color: string
  @Input() options: FeedbackOptions

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss(null, 'close')
  }

}
