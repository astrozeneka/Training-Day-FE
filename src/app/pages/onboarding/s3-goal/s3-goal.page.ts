import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s3-goal',
  templateUrl: './s3-goal.page.html',
  styleUrls: ['./s3-goal.page.scss', '../onboarding.scss'],
})
export class S3GoalPage implements OnInit {
  
  form: FormGroup = new FormGroup({
    goals: new FormControl([], [Validators.required]),
    otherGoals: new FormControl([], [])
  })

  displayedError = { // Unused for front-end validation
    goals: undefined, // Used to validate on the back-end only
    otherGoals: undefined
  }

  goalOptions: string[] = [
    "Perte de poids",
    "Prise de masse",
    "Rééquilibrage alimentaire ",
    "Renforcement musculaire",
    "Bien-être",

    "Autre(s)"
  ]

  goalKeyAccessor = (option: any) => option

  isLoading: boolean = false

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

    // 2. Dynamic validations of the input values (Grok)
    // Subscribe to changes in the 'goals' control
    this.form.get('goals')?.valueChanges.subscribe(value => {
      const otherGoalsControl = this.form.get('otherGoals');
      if (value.includes('Autre(s)')) {
        // If "Autre(s)" is selected, make 'otherGoals' required
        otherGoalsControl?.setValidators([Validators.required]);
      } else {
        // If "Autre(s)" is not selected, remove validators from 'otherGoals'
        otherGoalsControl?.clearValidators();
      }
      // Update the control's validity to reflect the new validation state
      otherGoalsControl?.updateValueAndValidity();
    });
  }

  submit(){
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s4-sleep'])
    })

  }

}
