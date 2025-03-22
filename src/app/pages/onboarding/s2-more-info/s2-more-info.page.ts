import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { OnboardingService } from 'src/app/onboarding.service';

@Component({
  selector: 'app-s2-more-info',
  templateUrl: './s2-more-info.page.html',
  styleUrls: ['./s2-more-info.page.scss', '../onboarding.scss'],
})
export class S2MoreInfoPage implements OnInit {
  
  form:FormGroup = new FormGroup({
    age: new FormControl('', [Validators.required]),
    weight: new FormControl('', [Validators.required, Validators.min(30), Validators.max(300)]),
    height: new FormControl('', [Validators.required, Validators.min(100), Validators.max(250)]),
    sex: new FormControl('', [Validators.required])
  })
  displayedError = {
    age: undefined,
    weight: undefined,
    height: undefined,
    sex: undefined
  }
  sexKeyAccessor = (option: any) => option
  sexOptions = [
    "Homme",
    "Femme"
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
      this.router.navigate(['s3-goal'])
    })
  }
}
 