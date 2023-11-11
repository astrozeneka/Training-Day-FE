import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";
import {FormComponent} from "../../form.component";

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss'],
})
export class PostViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  override form: FormGroup = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'content': new FormControl('', [Validators.required]),
    'permalink': new FormControl('', [Validators.required]),
    'tags': new FormControl(''),
    'access': new FormControl(''),
    'type': new FormControl(''),
    'featured_media': new FormControl('') // TODO: include the featured media
  })
  override displayedError = {
    'title': undefined,
    'content': undefined,
    'permalink': undefined,
    'tags': undefined,
    'access': undefined,
    'type': undefined,
    'featured_media': undefined
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
    console.log(this.form.value)
    // Additionnal patching value correction
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    let obj = this.form.value
    obj.id = this.entity?.id
    if(this.entity == null) {
      console.log(obj)
      this.contentService.post('/posts', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'title')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'tags')
            this.manageValidationFeedback(error, 'access')
            this.manageValidationFeedback(error, 'type')
            this.manageValidationFeedback(error, 'featured_media')
          }
          return throwError(error)
        }))
        .subscribe(async (res)=>{
          console.log(res)
          await this.feedbackService.registerNow("Un élément a été ajouté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null){
      console.log("Update")
      this.contentService.put('/posts', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'title')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'tags')
            this.manageValidationFeedback(error, 'access')
            this.manageValidationFeedback(error, 'type')
            this.manageValidationFeedback(error, 'featured_media')
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
