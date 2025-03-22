import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s5-food-and-water',
  templateUrl: './s5-food-and-water.page.html',
  styleUrls: ['./s5-food-and-water.page.scss', '../onboarding.scss'],
})
export class S5FoodAndWaterPage implements OnInit {

  form: FormGroup = new FormGroup({
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

  constructor(
    private cs: ContentService,
    private os: OnboardingService,
    private router: Router
  ) { }

  ngOnInit() {
    // 1. Load the user data from the onboarding service
    this.os.onOnboardingData().subscribe((data) => {
      this.form.patchValue(data)
    })
  }

  submit() {
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s6-activity'])
    })
  }

}
