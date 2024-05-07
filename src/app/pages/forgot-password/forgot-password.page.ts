import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })
  displayedError = {
    email: ''
  }

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) { }

  ngOnInit() {
  }

  submit(){
    this.contentService.post('/password-reset', this.form.value)
      .pipe(catchError(error=>{
        if(error.status == 403){
          this.feedbackService.register('Email not found or not verified')
          this.router.navigate(['/login'])
        }
        return throwError(error)
      }))
      .subscribe(async(res)=>{
        this.feedbackService.register('Password reset email sent')
        this.router.navigate(['/login'])
      })
  }

}
