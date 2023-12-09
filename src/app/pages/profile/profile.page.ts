import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  form:any = new FormGroup({
  });
  user_id: any = null;
  entity: any = null;
  old_profile_picture: any = null;

  constructor(
    private router:Router,
    private contentService: ContentService
  ) {
    // router.events.subscribe(()=> {
      this.contentService.storage.get('user')
        .then((u)=>{
          this.user_id = u.id
          // Reload the user information
          this.contentService.getOne('/users/details/' + u.id, {})
            .subscribe((u:any)=>{
              this.contentService.storage.set('user', u)
              this.entity = u;
              console.debug("Update user information")
              console.log(u)
            })
        })
    //})

  }

  ngOnInit() {

  }

  @ViewChild('fileInput') fileInput:any = undefined;
  profile_image: any = null
  handleFileInput(event: any) {
    let file = event.target.files[0];
    if(file){
      console.debug("File was uploaded")
      let reader = new FileReader()
      reader.onload = (e)=>{
        let base64 = reader.result as string
        this.profile_image = {
          name: file.name,
          type: file.type,
          base64: base64
        }
        console.debug(this.profile_image)
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
        return throwError(error)
      }))
      .subscribe(async(res)=>{
        console.log("Done")
      })
  }

  getStaticUrl(suffix:any){
    return this.contentService.rootEndpoint + '/' + suffix
  }
}
