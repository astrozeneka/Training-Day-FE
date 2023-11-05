import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import { format } from 'date-fns';
import {catchError, of, throwError} from "rxjs";

@Component({
  selector: 'app-dayoff-view',
  templateUrl: './dayoff-view.component.html',
  styleUrls: ['./dayoff-view.component.scss'],
})
export class DayoffViewComponent  implements OnInit {
  @Input() entity:null|any = null;

  form:FormGroup = new FormGroup({
    'user_id': new FormControl('', [Validators.required]),
    'content': new FormControl('', [Validators.required]),
    'date': new FormControl('', [Validators.required])
  })
  displayedError = {
    'user_id': undefined,
    'content': undefined,
    'date': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) { }

  ngOnInit() {
    // ต้องโหลดข้อมูล related tables
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    let obj = this.form.value
    obj.date = obj.date.split('T')[0]
    console.log(obj.date)
    this.contentService.post('/dayoff', obj)
      .pipe(catchError((error)=>{
        if(error.status == 422){
          console.log(error)
          if(error.error.errors['user_id'] != undefined){
            this.displayedError['user_id'] = error.error.errors['user_id']
            this.form.controls['user_id'].setErrors(error.error.errors['user_id'])
            this.form.controls['content'].markAsTouched()
          }else{
            this.displayedError['user_id'] = undefined
            this.form.controls['user_id'].setErrors(null);
          }
          if(error.error.errors['content'] != undefined){
            this.displayedError['content'] = error.error.errors['content']
            this.form.controls['content'].setErrors(error.error.errors['content'])
            this.form.controls['content'].markAsTouched()
          }else{
            this.displayedError['content'] = undefined
          }
          if(error.error.errors['date'] != undefined){
            this.displayedError['date'] = error.error.errors['date']
            this.form.controls['date'].setErrors(error.error.errors['date'])
            this.form.controls['content'].markAsTouched()
          }else{
            this.displayedError['date'] = undefined
          }
          return throwError(null)
        }
        return throwError(error)
      }))
      .subscribe(async(res)=>{
        await this.feedbackService.registerNow("Un jour de congé a été ajouté")
        this.modalCtrl.dismiss(null, 'insert-success')
      })

  }

}
