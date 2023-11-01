import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {ActivatedRoute, Router} from "@angular/router";

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
  displayedError = ""

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) { }

  submit(){
    this.contentService.post(`/posts?XDEBUG_SESSION_START=client`, this.form.value).subscribe((res:any)=>{
      if(res.hasOwnProperty('error')){
        this.displayedError = res['error']
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
