import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {catchError, throwError} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.page.html',
  styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage extends FormComponent implements OnInit {
  override form: FormGroup = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email]),
    'password': new FormControl('', [Validators.required]),
    'password_confirm': new FormControl('', [Validators.required]),
    'firstname': new FormControl('', [Validators.required]),
    'lastname': new FormControl('', [Validators.required]),
    'phone': new FormControl(''),
    'address': new FormControl('')
  })
  override displayedError = {
    'email': undefined, // ไม่ต้องใส่ Role
    'password': undefined,
    'password_confirm': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'phone': undefined,
    'address': undefined
  }

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {
    super()
  }

  ngOnInit() {
    // ไม่ต้องทำ patchValue
  }

  // ไม่ต้องโหลดข้อมูล
  // loadData() {}

  resetForm(){
    this.form.reset()
  }

  submitForm() {
    let obj = this.form.value
    // ต้องใส่โคตเพิ่มสำหรับรูปโปรไฟล์ฯลฯ
    this.contentService.post('/users', obj)
      .pipe(catchError((error)=>{
        if(error.status == 422){
          this.manageValidationFeedback(error, 'email')
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
        await this.feedbackService.registerNow("Inscription effectuée, vous pouvez désormais vous connecter")
        this.router.navigate(['/login'])
      })
  }

}
