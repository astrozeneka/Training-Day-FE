import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, from, switchMap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { Location } from '@angular/common';
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

  // Define whether the form is in onboarding mode or edit mode
  formMode: 'onboarding' | 'edit' = undefined;

  // User id (used to partial update it)
  userId: number = undefined;

  constructor(
    private cs: ContentService,
    private os: OnboardingService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  // User information
  user: User = undefined

  ngOnInit() {

    // 1. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.user = user;
      this.userId = user.id;
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

    // 4. Handling form mode
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('s8-health-status')))
      .subscribe((event: NavigationEnd) => {
        this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
      })
  }

  /**
   * Replacement of the submit() function from the previous version
   * Only used in onboarding mode
   */
  nextStep(){
    this.isLoading = true
    this.os.saveOnboardingData(this.form.value).then(()=>{
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
          this.isLoading = false
          // Go to next page
          this.router.navigate(['home'])
        })
    })
  }

  /**
   * Used when form mode is edit
   */
  update(){
    this.isLoading = true
    // 2. Save the form data
    from(this.os.saveOnboardingData(this.form.value))
      .pipe(
        switchMap(() => this.os.partialPersistOnboardingData(this.userId)
          .pipe(
            // 4. Handle errors
            catchError((error) => {
              this.isLoading = false
              console.error("Error", error)
              return throwError(() => error)
            })
          ))
      )
      .subscribe((res) => {
        this.isLoading = false
        this.location.back()
      })
  }

  submit(){
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    if (this.formMode === 'onboarding')
      return this.nextStep()
    else if (this.formMode === 'edit')
      return this.update()
  }

}
