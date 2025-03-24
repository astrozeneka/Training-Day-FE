import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s7-do-sport-regularly',
  templateUrl: './s7-do-sport-regularly.page.html',
  styleUrls: ['./s7-do-sport-regularly.page.scss', '../onboarding.scss'],
})
export class S7DoSportRegularlyPage implements OnInit {

  form: FormGroup = new FormGroup({
    everydaySport: new FormControl('', [Validators.required])
  })
  displayedError = {
    everydaySport: undefined
  }

  everydaySportKeyAccessor = (option: any) => option

  everydaySportOptions = [
    "Non",
    "Oui moins d’1h par semaine",
    "1 à 2h par semaine",
    "2 à 3h par semaine",
    "+ de 3h par semaine"
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
      this.router.navigate(['s8-health-status'])
    })
  }

}
