import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {catchError, throwError} from "rxjs";
import {FeedbackService} from "../../feedback.service";
import {FormComponent} from "../../components/form.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage extends FormComponent implements OnInit {
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

  constructor(
    private router:Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super();
    (async()=>{
      this.entity = await this.contentService.storage.get('user')
      this.user_id = this.entity.id
      this.form.patchValue(this.entity)
      console.log(this.entity)
    })();
  }

  ngOnInit() {

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
        console.debug("Update user information")
        this.feedbackService.register("Les informations ont été mises à jour", 'success')
        await this.contentService.reloadUserData()
        this.form.reset()
        this.router.navigate(["/home"]);
      })
  }

  getStaticUrl(suffix:any){
    return this.contentService.rootEndpoint + '/' + suffix
  }
}
