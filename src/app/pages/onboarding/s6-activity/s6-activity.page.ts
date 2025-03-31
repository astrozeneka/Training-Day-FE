import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, from, switchMap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { Location } from '@angular/common';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s6-activity',
  templateUrl: './s6-activity.page.html',
  styleUrls: ['./s6-activity.page.scss', '../onboarding.scss'],
})
export class S6ActivityPage implements OnInit {

  form: FormGroup = new FormGroup({
    activity: new FormControl('', [Validators.required])
  })
  displayedError = {
    activity: undefined
  }

  activityKeyAccessor = (option: any) => option.text
  activityOptions = [
    { "slug": "sedentary", "text": "Sédentaire (Travail de bureau et pas d'activité physique)" },
    { "slug": "light", "text": "Légèrement actif (Travail de bureau avec activité légère, activité physique occasionnelle)" },
    { "slug": "moderate", "text": "Modérément actif (Travail avec déplacement fréquents, activité physique régulière)" },
    { "slug": "intense", "text": "Très actif (Travail physique et activité physique quotidienne)" },
    { "slug": "extreme", "text": "Athlète (+2h de sport intensif par jour)" }
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
    
    // 2. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.userId = user.id;
    })

    // 3. Handling form mode
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('s6-activity')))
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
      this.router.navigate(['s7-do-sport-regularly'])
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
