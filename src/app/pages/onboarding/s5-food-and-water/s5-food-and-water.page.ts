import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { Location } from '@angular/common';
import { OnboardingService } from 'src/app/onboarding.service';
import { catchError, filter, from, switchMap, throwError } from 'rxjs';

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
    "1",
    "2",
    "3",
    "4",
    "Plus de 4",
  ]
  dailyWaterOptions = [
    "Moins de 1L",
    "Entre 1 et 1.5L",
    "Plus de 1.5L"
  ]
  dailyMealsKeyAccessor = (option: any) => option
  dailyWaterKeyAccessor = (option: any) => option

  isLoading: boolean = false;

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

  ngOnInit() {
    // 1. Load the user data from the onboarding service
    this.os.onOnboardingData().subscribe((data) => {
      this.form.patchValue(data)
    })

    // 2. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.userId = user.id;
    })

    // 3. Handling form mode
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('s5-food-and-water')))
      .subscribe((event: NavigationEnd) => {
        this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
      })
  }

  nextStep(){
    this.isLoading = true
    // 2. Safe the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s6-activity'])
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
      .subscribe((res) => {
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

}
