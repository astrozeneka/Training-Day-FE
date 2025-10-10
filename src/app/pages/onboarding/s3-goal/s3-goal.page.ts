import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, finalize, from, Observable, shareReplay, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';
import { Location } from '@angular/common';
import { User } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-s3-goal',
  templateUrl: './s3-goal.page.html',
  styleUrls: ['./s3-goal.page.scss', '../onboarding.scss'],
})
export class S3GoalPage implements OnInit, OnDestroy {
  
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
    "Rééquilibrage alimentaire",
    "Renforcement musculaire",
    "Bien-être",

    "Autre(s)"
  ]

  goalKeyAccessor = (option: any) => option

  isLoading: boolean = false

  // Define whether the form is in onboarding mode or edit mode
  formMode: 'onboarding' | 'edit' = undefined;

  // User id (used to partial update it)
  userId: number = undefined;
  
  // The user, it is preferable to keep the user observable (similarly to other pages (i.e. messenger-master)
  user$: Observable<User>;

  // Subject for cleaning up subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private cs: ContentService,
    private os: OnboardingService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ionViewWillEnter() {
    // 1. Load the user data from the onboarding service
    this.os.onOnboardingData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.form.patchValue(data)
      })


    this.user$ = this.cs.userStorageObservable.gso$().pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    )

    // 2. Load the user id
    //this.cs.getUserFromLocalStorage().then(user => {
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userId = user.id;
      })


    // 2. Dynamic validations of the input values (Grok)
    // Subscribe to changes in the 'goals' control
    this.form.get('goals')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
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

  ngOnInit() {

    // 3. Handling form mode
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd && this.router.url.includes('s3-goal')),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep() {
    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(() => {
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s4-sleep'])
    })
  }

  update(){
    this.isLoading = true
    // 2. Save the form data
    from(this.os.saveOnboardingData(this.form.value))
      .pipe(
        switchMap(() => this.os.partialPersistOnboardingData(this.userId)
          .pipe(
            finalize(() => this.isLoading = false)
          )
        )
      )
      .subscribe(() => {
        this.location.back()
      })
  }

  submit(){
    console.log("Submit")
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    if (this.formMode === 'onboarding')
      return this.nextStep()
    else if (this.formMode === 'edit')
      return this.update()
  }
  
  skip() {
    this.isLoading = true
    // Navigate to home
    // this.router.navigate(['s3-goal'])
    // Persist an empty object
    this.os.persistOnboardingData(this.userId)
      .pipe(
        // 4. Handle errors
        catchError((error) => {
          this.isLoading = false
          console.error("Error", error)
          return throwError(() => error)
        })
      )
      .subscribe((data) => {
        this.isLoading = false
        // Go to next page
        this.router.navigate(['/home'])
      })
  }

}
