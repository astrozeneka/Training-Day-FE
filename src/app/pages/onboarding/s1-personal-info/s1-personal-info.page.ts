import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular';
import { catchError, filter, throwError } from 'rxjs';
import { FormComponent } from 'src/app/components/form.component';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';
import PasswordToggle from 'src/app/utils/PasswordToggle';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-s1-personal-info',
  templateUrl: './s1-personal-info.page.html',
  styleUrls: ['./s1-personal-info.page.scss', '../onboarding.scss'],
})
export class S1PersonalInfoPage extends FormComponent implements OnInit {

  headerHeadline: string = "Créez un compte gratuitement"
  headerHelper: string = "Remplissez les champs ci-dessous pour créer un compte"
  passwordlessLogin: boolean = false // default is false

  // tooglable object for password display
  passwordToggle = new PasswordToggle()
  passwordConfirmToggle = new PasswordToggle()
  
  override form: FormGroup = new FormGroup({
    'email': new FormControl('', this.passwordlessLogin?[]:[Validators.required, Validators.email]),
    'password': new FormControl('', this.passwordlessLogin?[]:[Validators.required]),
    'password_confirm': new FormControl('', this.passwordlessLogin?[]:[Validators.required]),
    'firstname': new FormControl('', [Validators.required]),
    'lastname': new FormControl('', [Validators.required]),
    'phone_prefix': new FormControl('+33', [Validators.required]), // I don't know the default value doen't work
    'phone': new FormControl(''),
    'address': new FormControl(''),

    // Special form (used by passwordless login)
    'username': new FormControl('', []),

    // city and postal code
    'city': new FormControl('', [Validators.required]),
    'postal_code': new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    // Special fields
    'acceptConditions': new FormControl(false, [Validators.requiredTrue])
  })
  override displayedError = {
    'email': undefined, // ไม่ต้องใส่ Role
    'password': undefined,
    'password_confirm': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'phone': undefined,
    'address': undefined,
    //
    'city': undefined,
    'postal_code': undefined,
    // Special fields
    'acceptConditions': 'Vous devez accepter les conditions d\'utilisation' // UNused
  }
  formIsLoading:boolean = false

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private cs: ContentService
  ) { 
    super()
  }

  ngOnInit() {
    // 1. If the users navigate and lands on the page, the form is resetted (might be deleted later)
    this.router.events.pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/personal-info')))
      .subscribe(()=>{
        this.form.reset()
      })

    // 2. tmp-user-info for passwordless login goes here


    // 3. Default value for phone_prefix
    this.form.get('phone_prefix').patchValue('+33')
  }

  submitForm(){
    this.formIsLoading = true

    let obj = this.form.value
    obj['phone'] = obj['phone_prefix'] + obj['phone']

    this.contentService.post('/users', obj)
      .pipe(catchError((error)=>{
        if(error.status == 422){
          this.manageValidations(error)
        }
        return throwError(()=>error)
      }))
      .subscribe((response)=>{

      })
  }

  manageValidations(error){
    this.manageValidationFeedback(error, 'email')
    this.manageValidationFeedback(error, 'password')
    this.manageValidationFeedback(error, 'password_confirm')
    this.manageValidationFeedback(error, 'firstname')
    this.manageValidationFeedback(error, 'lastname')
    this.manageValidationFeedback(error, 'phone')
    this.manageValidationFeedback(error, 'address')
    this.manageValidationFeedback(error, 'city')
    this.manageValidationFeedback(error, 'postal_code')
    this.manageValidationFeedback(error, 'acceptConditions')
  }

  openCGU(){
    let url = environment.rootEndpoint + environment.cgu_uri
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }
}
