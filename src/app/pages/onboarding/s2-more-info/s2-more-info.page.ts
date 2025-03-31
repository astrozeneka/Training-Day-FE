import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, from, switchMap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-s2-more-info',
  templateUrl: './s2-more-info.page.html',
  styleUrls: ['./s2-more-info.page.scss', '../onboarding.scss'],
})
export class S2MoreInfoPage implements OnInit {

  form: FormGroup = new FormGroup({
    age: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    weight: new FormControl('', [Validators.required, Validators.min(30), Validators.max(300), Validators.pattern('^[0-9]+$')]),
    height: new FormControl('', [Validators.required, Validators.min(100), Validators.max(250), Validators.pattern('^[0-9]+$')]),
    sex: new FormControl('', [Validators.required])
  });
  displayedError = {
    age: undefined,
    weight: undefined,
    height: undefined,
    sex: undefined
  }
  sexKeyAccessor = (option: any) => { return { "male": "Homme", "female": "Femme" }[option] }
  sexOptions = [
    "male",
    "female"
  ]

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

    // 2. Load the user id
    // 1. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.userId = user.id;
    })


    // 3. Handling form mode
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('s2-more-info')))
      .subscribe((event: NavigationEnd) => {
        this.formMode = (this.route.snapshot.queryParamMap.get("mode") || 'onboarding' as any) as 'onboarding' | 'edit'
      })
  }

  nextStep() {
    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(() => {
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s3-goal'])
    })
  }

  update() {
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
}
