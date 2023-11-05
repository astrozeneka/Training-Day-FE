import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, of, throwError} from "rxjs";

@Component({
  selector: 'app-agency-view',
  templateUrl: './agency-view.component.html',
  styleUrls: ['./agency-view.component.scss'],
})
export class AgencyViewComponent  implements OnInit {
  @Input() entity:null|any = null;

  form:FormGroup = new FormGroup({
    'name': new FormControl('', [Validators.required]),
    'address': new FormControl(''),
    'subdistrict': new FormControl(''),
    'district': new FormControl(''),
    'city': new FormControl(''),
    'postal_code': new FormControl(''),
    'country': new FormControl(''),
  })
  displayedError = ({
    name: undefined
  })
  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) { }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    // It is better to send before dismissing
    // เพราะผู้ใช้งานอาจจะต้องแก้ข้อมูลอีกที่
    this.contentService.post('/agencies', this.form.value)
      .pipe(catchError((error)=>{
        if(error.status === 422){
          if(error.error.errors['name'] != undefined){
            this.displayedError['name'] = error.error.errors['name']
            this.form.controls['name'].setErrors(error.error.errors['name'])
          }
          return of(null)
        }
        return throwError(error)
      }))
      .subscribe(async(res)=>{
        await this.feedbackService.register("Une agence a été ajoutée")
        this.modalCtrl.dismiss(null, 'insert-success')
      })
  }
}
