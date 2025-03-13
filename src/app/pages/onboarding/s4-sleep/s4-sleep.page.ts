import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-s4-sleep',
  templateUrl: './s4-sleep.page.html',
  styleUrls: ['./s4-sleep.page.scss', '../onboarding.scss'],
})
export class S4SleepPage implements OnInit {

  form:FormGroup = new FormGroup({
    dailySleepHours: new FormControl(null, [Validators.required])
  })
  displayedError = {
    dailySleepHours: undefined
  }
  dailySleepHoursOptions = [
    "Moins de 4 heures",
    "Entre 4 et 6 heures",
    "Entre 6 et 8 heures",
    "Plus de 8 heures"
  ]
  dailySleepHoursKeyAccessor = (option: any) => option

  isLoading: boolean = false;

  submit(){
    // TODO ....
  }

  constructor() { }

  ngOnInit() {
  }

  private manageValidationFeedback(error:any, slug:string, form:FormGroup<any>=undefined){
    if (!form) {
      form = this.form
    }
    if(error.error.errors[slug]){
      console.log(form)
      this.displayedError[slug] = error.error.errors[slug]
      form.controls[slug].setErrors(error.error.errors[slug])
      form.controls[slug].markAsTouched()
    } else {
      this.displayedError[slug] = undefined
    }
  }
}
