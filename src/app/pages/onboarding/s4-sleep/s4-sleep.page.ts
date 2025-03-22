import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s4-sleep',
  templateUrl: './s4-sleep.page.html',
  styleUrls: ['./s4-sleep.page.scss', '../onboarding.scss'],
})
export class S4SleepPage implements OnInit {

  form: FormGroup = new FormGroup({
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

    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s5-food-and-water'])
    })
  }
}
