import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { catchError, finalize, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';

@Component({
  selector: 'app-set-appointment',
  templateUrl: './set-appointment.page.html',
  styleUrls: ['./set-appointment.page.scss'],
})
export class SetAppointmentPage implements OnInit {
  form = new FormGroup({
    'reason': new FormControl('', [Validators.required]),
    'datetime': new FormControl('', [Validators.required]),
    'user_id': new FormControl(''),
  })
  formIsLoading = false;
  displayedError = {
    'reason': undefined,
    'datetime': undefined
  }
  minDate = undefined
  maxDate = undefined

  constructor(
    private route: ActivatedRoute,
    private cs: ContentService,
    private fs: FeedbackService,
    private router: Router
  ) { }

  ngOnInit() {
    //this.minDate = new Date().toISOString()
    // After one month
    //this.maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    this.minDate = moment().toISOString()
    this.maxDate = moment().add(3, 'months').toISOString()
    // Get the user_id from the route
    this.route.params.subscribe(params => {
      this.form.patchValue({
        'datetime': moment().toISOString(),
        'user_id': params['id'] 
      })
    })
  }

  async submitForm(){
    // Mark form as touch in order to show the errors
    this.form.markAllAsTouched()
    if (!this.form.valid)
      return
    this.formIsLoading = true;
    this.cs.post('/appointments', this.form.value)
    .pipe(catchError((error)=>{
      return throwError(error)
    }), finalize(()=>{
      this.formIsLoading = false;
    }))
    .subscribe(async (response: any) => {
      this.form.reset()
      this.fs.register(
        "Le rendez-vous a été fixé, le client recevra une notification",
        "success"
      )
      this.router.navigate(['/chat/'])
    })
    
  }

}