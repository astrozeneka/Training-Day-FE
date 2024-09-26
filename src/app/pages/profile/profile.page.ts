import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {catchError, merge, of, throwError} from "rxjs";
import {FeedbackService} from "../../feedback.service";
import {FormComponent} from "../../components/form.component";
import {ModalController, Platform} from "@ionic/angular";
import {
  PasswordConfirmationModalComponent
} from "../../components/password-confirmation-modal/password-confirmation-modal.component";
import {navigate} from "ionicons/icons";
import StorePlugin from "../../custom-plugins/store.plugin";
import {EntitlementReady} from "../../abstract-components/EntitlementReady";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage extends FormComponent implements OnInit {
  entitlementComponent = new EntitlementReady()
  active_entitled_subscription = null

  override form:any = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email]), // readonly
    'password': new FormControl(''),
    'password_confirm': new FormControl(''),
    'firstname': new FormControl('', [Validators.required]),
    'lastname': new FormControl('', [Validators.required]),
    'phone': new FormControl(''),
    'address': new FormControl('')
  });
  override displayedError = {
    'email': undefined, // read only
    'password': undefined,
    'password_confirm': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'phone': undefined,
    'address': undefined
  }

  user_id: any = null;
  entity: any = null;
  old_profile_picture: any = null;
  grouped_perishables: { [key: string]: any; } = {
  };

  constructor(
    private router:Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private modalCtrl: ModalController,
    private platform: Platform
  ) {
    super();
    router.events.subscribe(async(event: any)=>{ // This way of loading data is not suitable for angular
      if (event instanceof NavigationEnd && event.url == '/profile') {
        this.entity = await this.contentService.storage.get('user')
        // Define one dictionnary by mapping the this.entity.grouped_perishables
        this.grouped_perishables = this.entity.grouped_perishables.reduce((acc:any, item:any)=>{
          acc[item.slug] = item
          return acc
        }, {})
        this.user_id = this.entity?.id
        this.form.patchValue(this.entity)
      }
    });

    (async()=>{
      await this.entitlementComponent.loadEntitlements()
      this.active_entitled_subscription = this.entitlementComponent.active_entitled_subscription
    })();
  }

  ngOnInit() {
    // This is the new way to retrieve user data from local
    this.contentService.userStorageObservable.getStorageObservable().subscribe(async(user)=>{
      this.entity = user // This is the correct way
      // The other function should't be used in this component
      if(this.entity.user_settings){
        this.activityStatusForm.patchValue(this.entity.user_settings)
      }
    })
  }

  @ViewChild('fileInput') fileInput:any = undefined;
  profile_image: any = null
  handleFileInput(event: any) {
    let file = event.target.files[0];
    if(file){
      let reader = new FileReader()
      reader.onload = (e)=>{
        let base64 = reader.result as string
        this.profile_image = {
          name: file.name,
          type: file.type,
          base64: base64
        }
      }
      reader.readAsDataURL(file)
    }
  }

  selectImage(){
    this.fileInput.nativeElement.click()
  }

  submit(){
    let obj = this.form.value
    obj.id = this.user_id
    obj.profile_image = this.profile_image
    this.contentService.put('/users', obj)
      .pipe(catchError(error=>{
        if(error.status == 422){
          this.manageValidationFeedback(error, 'password')
          this.manageValidationFeedback(error, 'password_confirm')
          this.manageValidationFeedback(error, 'firstname')
          this.manageValidationFeedback(error, 'lastname')
          this.manageValidationFeedback(error, 'phone')
        }
        return throwError(error)
      }))
      .subscribe(async(res)=>{
        this.feedbackService.register("Les informations ont été mises à jour", 'success')
        await this.contentService.reloadUserData()
        this.form.reset()
        this.router.navigate(["/home"]);
      })
  }

  getStaticUrl(suffix:any){
    return this.contentService.rootEndpoint + '/' + suffix
  }

  async deleteAccount(){
    // Show modal
    let modal = await this.modalCtrl.create({
      component: PasswordConfirmationModalComponent,
      componentProps: {}
    })
    await modal.present()
    let {data, role} = await modal.onDidDismiss()
    if(role == 'confirm'){
      // Send DELETE method to the backend
      let user = await this.contentService.storage.get('user')
      let obj: any = {
        id: this.user_id,
        email: user.email,
        password: data
      }
      // Try to request login
      this.contentService.requestLogin(obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.feedbackService.registerNow("Le mot de passe est requis", 'danger')
          }
          if(error.status == 401){
            this.feedbackService.registerNow("Le mot de passe est incorrect", 'danger')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.contentService.storage.clear()
          let id_list = this.user_id.toString()
          await this.contentService.delete('/users', id_list)
            .subscribe(()=>{
              this.feedbackService.register("Le compte a été supprimé", 'success')
              this.router.navigate(["/login"]);
            })
          // this.router.navigate(["/login"]);
        })

      /*
      this.contentService.deleteOne('/users/self', obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.feedbackService.registerNow("Le mot de passe est incorrect", 'danger')
          }
          return throwError(error)
        }))
        .subscribe(async()=>{
          console.debug("Delete user account")
          this.feedbackService.register("Le compte a été supprimé", 'success')
          await this.contentService.storage.clear()
          this.router.navigate(["/login"]);
        })

       */
    }
  }

  navigate(url:string){
    this.router.navigate([url])
  }

  sendVerificationEmail(){
    this.contentService.getOne('/verifyEmail', {})
      .subscribe((res)=>{
        if(res){
          this.feedbackService.registerNow("Un email de vérification a été envoyé", 'success')
        }
      })
  }

  endSubscription(){
    this.contentService.post('/cancel-subscription', {})
      .subscribe((res)=>{
        if(res){
          console.log(res)
          this.feedbackService.register("Votre abonnement a été annulé", "success")
          this.router.navigate(['/home'])
        }
      })
  }

  presentManageModal(){
    if(this.platform.is('ios') || true){
      let res = StorePlugin.present({
        message: "Manage subscription"
      })
    }else{
      this.feedbackService.registerNow("La gestion des abonnements n'est pas disponible sur cette plateforme", 'danger')
    }
  }

  protected readonly Object = Object; // Should be removed

  // The form for activity (can be updated independantly from the main form)
  activityStatusForm:FormGroup = new FormGroup({
    'activeFrom': new FormControl(''),
    'activeTo': new FormControl(''),
    'pauseDays': new FormControl(''),
  })
  activityStatusDisplayedError = {
    'activeFrom': undefined,
    'activeTo': undefined,
    'pauseDays': undefined
  }
  submitActivityStatusForm(){
    let formData = this.activityStatusForm.value
    // For each key in obj
    let observables = []
    for(let key in formData){
      let obj = {
        user_id: this.user_id,
        key: key,
        value: formData[key],
      }
      observables.push(this.contentService.put('/user-settings', obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.manageValidationFeedback(error, key, this.activityStatusForm)
          }
          return throwError(error)
        })))
    }
    // Run and merge all using forkJoin
    merge(...observables)
      .subscribe(async()=>{
        await this.contentService.reloadUserData()
        
        this.feedbackService.registerNow("Vos paramètres ont été mises à jour", 'success')
      })

    /*
    this.contentService.put('/settings/activityStatus', obj)
    .pipe(catchError(error=>{
      if(error.status == 422){
        this.manageValidationFeedback(error, 'activeFrom', this.activityStatusForm)
        this.manageValidationFeedback(error, 'activeTo', this.activityStatusForm)
        this.manageValidationFeedback(error, 'pauseDays', this.activityStatusForm)
      }
      return throwError(error)
    }))
    .subscribe(async(res)=>{
      this.feedbackService.registerNow("Vos paramètres ont été mises à jour", 'success')
    })*/
  }

}
