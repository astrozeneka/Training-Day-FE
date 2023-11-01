import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, of, throwError} from "rxjs";

@Component({
  selector: 'app-manage-posts-add',
  templateUrl: './manage-posts-add.page.html',
  styleUrls: ['./manage-posts-add.page.scss'],
})
export class ManagePostsAddPage implements OnInit {
  form: FormGroup = new FormGroup<any>({
    'title': new FormControl('', Validators.required),
    'permalink': new FormControl(''),
    'content': new FormControl(''),
    'tags': new FormControl(''),
    'access': new FormControl(''),
    'type': new FormControl('')
  })
  displayedError = {
    'permalink': null
  }

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) { }

  submit(){
    this.contentService.post(`/posts?XDEBUG_SESSION_START=client`, this.form.value)
      .pipe(
        catchError((error)=>{
          if (error.status === 422){
            if(error.error.errors.permalink != undefined){
              this.displayedError['permalink'] = error.error.errors.permalink
              this.form.controls['permalink'].setErrors({notUnique: true})
              this.form.controls['permalink'].markAsTouched()
            }
            return of(null)
          }else{
            return throwError(error)
          }
        })
      )
      .subscribe((res:any)=>{
        if(res.hasOwnProperty('error')){
          this.displayedError = res['error']
          console.log(res)
          // TODO: patch validation
        }else{
          this.feedbackService.register("Votre article a été inséré")
          this.router.navigate(["/manage/posts/view"])
        }
      })
  }

  ngOnInit() {
  }

}
