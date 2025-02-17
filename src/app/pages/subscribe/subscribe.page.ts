import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {catchError, finalize, throwError} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import PasswordToggle from 'src/app/utils/PasswordToggle';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.page.html',
  styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage extends FormComponent implements OnInit {
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
    private platform: Platform
  ) {
    super()
    router.events.subscribe(async(event: any)=>{
      if (event instanceof NavigationEnd) {
        // Clear the form
        this.resetForm()
      }
    })
  }

  async ngOnInit() {
    // ไม่ต้องทำ patchValue
    // check if tmp-user-info is available
    let tmpUserDataBndl = await this.contentService.storage.get('tmp-user-info');
    if (tmpUserDataBndl && tmpUserDataBndl['next-step'] == 'prompt-user-info'){
      let tmpUser = tmpUserDataBndl['user']
      if (['github', 'google', 'facebook'].includes(tmpUser['provider'])) {
        this.passwordlessLogin = true
        this.headerHelper = "Créez un compte training-day en quelques clics"
        this.form.patchValue({
          'username': tmpUser['provider_uid']
        })
      }
    }
    // Default value
    this.form.get('phone_prefix').patchValue('+33')
  }

  // ไม่ต้องโหลดข้อมูล
  // loadData() {}

  resetForm(){
    this.form.reset()
  }

  async submitForm() {
    this.formIsLoading = true
    let obj = this.form.value
    obj['phone'] = obj['phone_prefix'] + obj['phone']
    if(this.passwordlessLogin){
      let tmpUser = (await this.contentService.storage.get('tmp-user-info'))['user']
      obj['email_verification_token'] = tmpUser['email_verification_token']
    }
    // ต้องใส่โค้ตเพิ่มสำหรับรูปโปรไฟล์ฯลฯ
    this.contentService.post('/users', obj)
      .pipe(catchError((error)=>{
        if(error.status == 422){
          console.log(error.error)
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
        return throwError(error)
      }), finalize(async ()=>{
        this.formIsLoading = false;
        await this.contentService.storage.remove('tmp-user-info')
      }))
      .subscribe(async(res)=>{
        await this.feedbackService.registerNow("Inscription effectuée, vous pouvez désormais vous connecter")
        this.router.navigate(['/verify-mail'])
      })
  }

  // 3. Open the CGU page
  openCGU(){
    let url = environment.rootEndpoint + environment.cgu_uri
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }
}
