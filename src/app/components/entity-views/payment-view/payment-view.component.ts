import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FormComponent} from "../../form.component";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.scss'],
})
export class PaymentViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  override form: FormGroup = new FormGroup({
    'amount': new FormControl('', Validators.required),
    'datetime': new FormControl(''),
    'permalink': new FormControl(''),
    'description': new FormControl('')
  })
  override displayedError = {
    'amount': undefined,
    'datetime': undefined,
    'permalink': undefined,
    'description': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super()
  }

  ngOnInit() {
    this.form.patchValue(this.entity)
    // Additionnal patching value correction
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    let obj = this.form.value
    obj.id = this.entity?.id
    obj.datetime = obj.datetime.split('T')[0]
    if(this.entity == null) {
      this.contentService.post('/payments', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'amount')
            this.manageValidationFeedback(error, 'datetime')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'description')
          }
          return throwError(error)
        }))
        .subscribe(async (res) => {
          await this.feedbackService.registerNow("Un élément a été ajouté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null){
      this.contentService.put('/payments', obj)
        .pipe(catchError((error)=>{
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'amount')
            this.manageValidationFeedback(error, 'datetime')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'description')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.feedbackService.registerNow("Un élément a été mis à jour")
          this.modalCtrl.dismiss(null, 'update-success')
        })
    }
  }
}
