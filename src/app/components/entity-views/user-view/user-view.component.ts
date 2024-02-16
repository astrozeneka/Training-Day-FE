import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FormComponent} from "../../form.component";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  override form: FormGroup = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email]),
    'role': new FormControl('', [Validators.required]),
    'password': new FormControl('', [Validators.required]),
    'password_confirm': new FormControl('', [Validators.required]),
    'firstname': new FormControl('', [Validators.required]),
    'lastname': new FormControl('', [Validators.required]),
    'phone': new FormControl(''),
    'address': new FormControl('')
  })
  override displayedError = {
    'email': undefined,
    'role': undefined,
    'password': undefined,
    'password_confirm': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'phone': undefined,
    'address': undefined
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
    this.loadData()
    // Additionnal patching value correction
  }

  loadData(){
    if(this.entity){
      this.contentService.getOne(`/users/${this.entity.id}`, {})
        .subscribe(data=>{
          this.entity = data;
        })
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }


  async confirm() {
    let fileInput: any = document.querySelector('input[name=profile_image]')
    let file = fileInput?.files[0]
    let fileContent = await this.readFile(file)
    let obj = this.form.value
    obj.id = this.entity?.id
    obj.profile_image = fileContent;
    if(this.entity == null){
      this.contentService.post('/users', obj)
        .pipe(catchError((error)=>{
          if(error.status == 402) {
            this.manageValidationFeedback(error, 'email')
            this.manageValidationFeedback(error, 'role')
            this.manageValidationFeedback(error, 'password')
            this.manageValidationFeedback(error, 'password_confirm')
            this.manageValidationFeedback(error, 'firstname')
            this.manageValidationFeedback(error, 'lastname')
            this.manageValidationFeedback(error, 'phone')
            this.manageValidationFeedback(error, 'address')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.feedbackService.registerNow("Un élément a été ajouuté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null){ // อั้ปเดต entity
      this.contentService.put('/users', obj)
        .pipe(catchError((error)=>{
          if(error.status == 402) {
            this.manageValidationFeedback(error, 'email')
            this.manageValidationFeedback(error, 'role')
            this.manageValidationFeedback(error, 'password')
            this.manageValidationFeedback(error, 'password_confirm')
            this.manageValidationFeedback(error, 'firstname')
            this.manageValidationFeedback(error, 'lastname')
            this.manageValidationFeedback(error, 'phone')
            this.manageValidationFeedback(error, 'addresse')
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
