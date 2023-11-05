import {Component, Input, OnInit} from '@angular/core';
import {FormComponent} from "../../form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-appointment-view',
  templateUrl: './appointment-view.component.html',
  styleUrls: ['./appointment-view.component.scss'],
})
export class AppointmentViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  protected userList: Array<any> = []
  // TODO: replace by coach list and customer list
  protected coachList: Array<any> = []
  protected customerList: Array<any> = []

  override form: FormGroup = new FormGroup({
    'description': new FormControl('', [Validators.required]),
    'coach_id': new FormControl('', [Validators.required]),
    'customer_id': new FormControl('', [Validators.required]),
    'date': new FormControl('', [Validators.required]),
    'hour': new FormControl('', [Validators.required]),
    'type': new FormControl('', [Validators.required])
  })
  override displayedError = {
    'description': undefined,
    'coach_id': undefined,
    'customer_id': undefined,
    'date': undefined,
    'hour': undefined,
    'type': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super()
  }

  ngOnInit() {
    this.loadData()
    this.form.patchValue(this.entity)
    // TODO: after the seeding, update this code
    this.form.controls["coach_id"].patchValue(this.entity.members[0].id)
    this.form.controls["customer_id"].patchValue(this.entity.members[1].id)
    this.form.controls["hour"].patchValue(this.entity.hour.toString())
    console.log(this.entity)
  }

  loadData(){
    this.contentService.get('/users').subscribe(([data, metaInfo])=>{
      this.userList = data as unknown as Array<any>
      console.log(this.userList)
      // TODO: should separate the coach and the normal user, use ChatGPT
    })
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    let obj = this.form.value
    obj.id = this.entity?.id
    obj.date = obj.date.split('T')[0]
    if(this.entity == null) { // สร้าง entity ใหม่
      this.contentService.post('/appointments', obj)
        .pipe(catchError((error)=>{
          if (error.status == 402) {
            this.manageValidationFeedback(error, 'description')
            this.manageValidationFeedback(error, 'coach_id')
            this.manageValidationFeedback(error, 'customer_id')
            this.manageValidationFeedback(error, 'date')
            this.manageValidationFeedback(error, 'hour')
            this.manageValidationFeedback(error, 'type')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.feedbackService.registerNow("Un élément a été ajouuté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null ) { // อั้ปเดต entity
      this.contentService.put('/appointments', obj)
        .pipe(catchError((error)=>{
          if (error.status == 402) {
            this.manageValidationFeedback(error, 'description')
            this.manageValidationFeedback(error, 'coach_id')
            this.manageValidationFeedback(error, 'customer_id')
            this.manageValidationFeedback(error, 'date')
            this.manageValidationFeedback(error, 'hour')
            this.manageValidationFeedback(error, 'type')
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
