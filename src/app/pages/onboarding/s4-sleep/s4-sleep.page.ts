import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';
import { Location } from '@angular/common';
import { catchError, filter, from, Observable, shareReplay, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { User } from 'src/app/models/Interfaces';

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

  ngOnInit() {

    // 3. Handling form mode
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('s4-sleep')))
      .subscribe((event: NavigationEnd) => {
        this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter(){
    // 1. Load the user data from the onboarding service
    this.os.onOnboardingData().subscribe((data) => {
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

    // Update form mode on each view entry
    this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
  }

  nextStep(){
    this.isLoading = true
    // 2. Safe the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s5-food-and-water'])
    })
  }

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
      .subscribe((res)=>{
        console.log(res)
        this.isLoading = false
        this.location.back()
      })
  }

  submit() {
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
      .subscribe(() => {
        this.isLoading = false
        // Go to home
        this.router.navigate(['/home'])
      })
  }
}
