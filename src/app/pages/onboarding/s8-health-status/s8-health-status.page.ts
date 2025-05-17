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
  template: `
  <ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
        <app-back-button></app-back-button>
        <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title *ngIf="formMode == 'onboarding'">Inscription</ion-title>
    <ion-title *ngIf="formMode == 'edit'">Modifier</ion-title>
    <ion-progress-bar value="0.8888888888" *ngIf="formMode == 'onboarding'"></ion-progress-bar>
    <ion-progress-bar [class]="(isLoading?'':'hidden')" type="indeterminate" *ngIf="formMode == 'edit'"></ion-progress-bar>
  </ion-toolbar>
</ion-header>


<ion-content>
  <div [class]="'loading-placeholder ' + (isLoading ? '' : 'hidden')">
    <ion-spinner name="crescent"></ion-spinner>
  </div>
  <form [formGroup]="form" (submit)="submit()">

    <div class="ion-padding-horizontal">
      <div class="onboarding-title">
        As-tu des soucis de santé ?
      </div>
      <div class="onboarding-subtitle">
        Il y a quelque chose qui te semble pertinent et que ton coach doit prendre en compte ?
      </div>
    </div>

    <div class="input-wrapper multi-selector-wrapper">
      <app-bubble-multi-selector
        [options]="['Pas de soucis de santé']"
        formControlName="noHealthIssues"
        [keyAccessor]="healthConditionsKeyAccessor"
        mode="multiple"
      ></app-bubble-multi-selector>
      <app-bubble-multi-selector
        [options]="healthConditionsOptions"
        formControlName="healthConditions"
        [keyAccessor]="healthConditionsKeyAccessor"
        [errorText]="displayedError.healthConditions"
        mode="multiple"
        [disabled]="form.get('noHealthIssues').value.length > 0"
      ></app-bubble-multi-selector>
    </div>
    <div [class]="'input-wrapper animated ' + (form.get('healthConditions').value.includes('Autre(s)') ? '' : 'hidden')">
      <app-outline-input
        label="Autre(s)"
        formControlName="otherHealthConditions"
        [errorText]="displayedError.otherHealthConditions"
        [disabled]="form.get('noHealthIssues').value.length > 0"
      ></app-outline-input>
    </div>

    <br/><br/><br/><br/><br/><br/>
    <div class="onboarding-floating-bottom-1">
      <div class="ion-padding">
        <app-ux-button
          expand="block" 
          color="primary" 
          shape="round" 
          [disabled]="!form.valid"
          [loading]="isLoading"
        >
          <div *ngIf="formMode == 'onboarding'">Continuer</div>
          <div *ngIf="formMode == 'edit'">Mettre à jour</div>
        </app-ux-button>
      </div>
    </div>
  </form>
</ion-content>
  `,
  styles: [`
    

.input-wrapper.animated{
    max-height: 250px;
    overflow: hidden;
    // animation on height
    transition: max-height 0.2s;

    &.multi-selector-wrapper{
    }

    &.hidden{
        max-height: 0px;
        // Delete max-height transiation
        transition: none;
    }
}



/**
 * The code below are experimental feature for new kind of loader
 */
 .loading-placeholder {
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 900000;
    // background blur
    backdrop-filter: blur(10px);
    background-color: rgba(var(--ion-color-background-rgb), 0.2);

    opacity: 1;
    transition: opacity 0.3s;

    &.hidden{
        z-index: -1;
        opacity: 0;
    }
}

/**
 * The code below are experimental feature for new kind of loader
 */
ion-progress-bar[type=indeterminate]{
    opacity: 1;
    height: 4px;
    transition: height 0.3s;

    &.hidden{
        opacity: 0;
        height: 0px;
    }
}
    `],
  styleUrls: ['../onboarding.scss'],
})
export class S8HealthStatusPage implements OnInit {

  form: FormGroup = new FormGroup({
    noHealthIssues: new FormControl([], []),
    healthConditions: new FormControl([], [Validators.required]),
    otherHealthConditions: new FormControl([], [])
  })

  displayedError = {
    noHealthIssues: undefined,
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
    
    // 5. Handle "no health issues" selection
    // Handle "no health issues" selection
    this.form.get('noHealthIssues')?.valueChanges.subscribe(value => {
      const healthConditionsControl = this.form.get('healthConditions');
      const otherHealthConditionsControl = this.form.get('otherHealthConditions');
      
      if (value.length > 0) {
        // Clear and disable health conditions when "no issues" is selected
        healthConditionsControl?.setValue([]);
        healthConditionsControl?.clearValidators();
        otherHealthConditionsControl?.setValue([]);
        otherHealthConditionsControl?.clearValidators();
      } else {
        // Re-enable and add required validator when "no issues" is deselected
        healthConditionsControl?.setValidators([Validators.required]);
      }
      
      healthConditionsControl?.updateValueAndValidity();
      otherHealthConditionsControl?.updateValueAndValidity();
    });
  }

  /**
   * Replacement of the submit() function from the previous version
   * Only used in onboarding mode
   */
  nextStep() {
    this.isLoading = true
    this.os.saveOnboardingData(this.form.value).then(() => {
      this.os.persistOnboardingData(this.user.id)
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
          this.router.navigate(['home'])
        })
    })
  }

  /**
   * Used when form mode is edit
   */
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
      .subscribe((res) => {
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
