import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-s2-more-info',
  templateUrl: './s2-more-info.page.html',
  styleUrls: ['./s2-more-info.page.scss', '../onboarding.scss'],
})
export class S2MoreInfoPage implements OnInit {
  
  form:FormGroup = new FormGroup({
    age: new FormControl('', [Validators.required]),
    weight: new FormControl('', [Validators.required]),
    height: new FormControl('', [Validators.required]),
    sex: new FormControl('', [Validators.required])
  })
  displayedError = {
    age: undefined,
    weight: undefined,
    height: undefined,
    sex: undefined
  }
  sexKeyAccessor = (option: any) => option
  sexOptions = [
    "Homme",
    "Femme"
  ]

  isLoading: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  submit(){

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
 