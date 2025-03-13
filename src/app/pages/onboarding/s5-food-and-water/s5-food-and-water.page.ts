import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-s5-food-and-water',
  templateUrl: './s5-food-and-water.page.html',
  styleUrls: ['./s5-food-and-water.page.scss', '../onboarding.scss'],
})
export class S5FoodAndWaterPage implements OnInit {

  form:FormGroup = new FormGroup({
    dailyMeals: new FormControl(null, [Validators.required]),
    dailyWater: new FormControl(null, [Validators.required])
  })
  displayedError = {
    dailyMeals: undefined,
    dailyWater: undefined
  }
  dailyMealsOptions = [
    "Moins de 3 repas",
    "3 repas",
    "Plus de 3 repas"
  ]
  dailyWaterOptions = [
    "Moins de 1L",
    "Entre 1 et 2L",
    "Plus de 2L"
  ]
  dailyMealsKeyAccessor = (option: any) => option
  dailyWaterKeyAccessor = (option: any) => option

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
