import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import { format } from 'date-fns';
import {catchError, of, throwError} from "rxjs";
import {FormComponent} from "../../form.component";

@Component({
  selector: 'app-dayoff-view',
  templateUrl: './dayoff-view.component.html',
  styleUrls: ['./dayoff-view.component.scss'],
})
export class DayoffViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  // Related element (user)
  protected userList: Array<any> = []

  override form:FormGroup = new FormGroup({
    'user_id': new FormControl('', [Validators.required]),
    'content': new FormControl('', [Validators.required]),
    'date': new FormControl('', [Validators.required])
  })
  override displayedError = {
    'user_id': undefined,
    'content': undefined,
    'date': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super()
  }

  ngOnInit() {
    // ต้องโหลดข้อมูล related tables
    this.loadData()
    this.form.patchValue(this.entity)
  }

  loadData(){
    this.contentService.get('/users').subscribe(([data, metaInfo])=>{
      this.userList = data as unknown as Array<any>
      console.log(this.userList)
    })
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    let obj = this.form.value
    obj.id = this.entity?.id
    obj.date = obj.date.split('T')[0]
    console.log(obj.date)
    if(this.entity == null) { // New element
      this.contentService.post('/dayoff', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'user_id')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'date')
          }
          return throwError(error)
        }))
        .subscribe(async (res) => {
          await this.feedbackService.registerNow("Un élément a été ajouté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null){ // Update an existing element
      this.contentService.put('/dayoff', obj)
        .pipe(catchError((error)=>{
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'user_id')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'date')
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
