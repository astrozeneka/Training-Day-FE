import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s8-health-status',
  templateUrl: './s8-health-status.page.html',
  styleUrls: ['./s8-health-status.page.scss', '../onboarding.scss'],
})
export class S8HealthStatusPage implements OnInit {
  
  form: FormGroup = new FormGroup({
    healthConditions: new FormControl([], [Validators.required]),
    otherHealthConditions: new FormControl([], [])
  })

  displayedError = {
    healthConditions: undefined,
    otherHealthConditions: undefined
  }

  healthConditionsOptions: string[] = [
    "Hypertension artérielle",
    "Diabète",
    "Obésité",
    "Maladie cardiaque",
    "Cancer",
    "Dépression",
    "Troubles anxieux",
    "Maladies respiratoires",
    "Autre(s)"
  ]

  healthConditionsKeyAccessor = (option: any) => option

  isLoading: boolean = false

  constructor(
    private cs: ContentService,
    private os: OnboardingService,
    private router: Router
  ) { }

  // User information
  user: User = undefined

  ngOnInit() {

    // 1. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.user = user;
    })

    // 2. Load the user data from the onboarding service
    this.os.onOnboardingData().subscribe((data) => {
      this.form.patchValue(data)
    })

    // 3. Dynamic validations of the input values (Grok)
    // Subscribe to changes in the 'goals' control
    this.form.get('healthConditions')?.valueChanges.subscribe(value => {
      const otherHealthConditionsControl = this.form.get('otherHealthConditions');
      if (value.includes('Autre(s)')) {
        // If "Autre(s)" is selected, make 'otherHealthConditions' required
        otherHealthConditionsControl?.setValidators([Validators.required]);
      } else {
        // If "Autre(s)" is not selected, remove validators from 'otherHealthConditions'
        otherHealthConditionsControl?.clearValidators();
      }
      otherHealthConditionsControl?.updateValueAndValidity();
    });
  }

  submit(){
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{

      // 3. Persist the data to the backend
      this.os.persistOnboardingData(this.user.id)
        .pipe(
          // 4. Handle errors
          catchError((error)=>{
            this.isLoading = false
            console.error("Error", error)
            return throwError(()=>error)
          })
        )
        .subscribe((data)=>{
          console.log("OK")
          this.isLoading = false
          // Go to next page
          this.router.navigate(['home'])
        })

    })
  }

}
