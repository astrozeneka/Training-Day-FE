import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
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

  submit(){
    // 1. Check if the form is valid
    if (!this.form.valid)
      return

    this.isLoading = true
    // 2. Save the form data
    this.os.saveOnboardingData(this.form.value).then(()=>{
      this.isLoading = false

      // Go to next page
      this.router.navigate(['s7-do-sport-regularly'])
    })
  }

}
