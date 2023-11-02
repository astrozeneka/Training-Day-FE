import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {HttpClient} from "@angular/common/http";
import {catchError, of, throwError} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: 'app-manage-files-add',
  templateUrl: './manage-files-add.page.html',
  styleUrls: ['./manage-files-add.page.scss'],
})
export class ManageFilesAddPage implements OnInit {

  displayedError = {
    'file': undefined
  }

  form = new FormGroup({
    'file': new FormControl('', Validators.required)
  })

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid) {
      let fileInput: any = document.querySelector('input[name=file]')
      let file = fileInput?.files[0]
      if(file){
        const reader = new FileReader();
        reader.onload = (e)=>{
          let base64 = reader.result as string
          let obj = {
            name: file.name,
            type: file.type,
            permalink: null,
            base64: base64
          }
          this.contentService.post('/files', obj)
            .pipe(catchError((error)=>{
              if(error.status === 422){
                if(error.error.errors.file != undefined){
                  this.displayedError['file'] = error.error.errors.file
                  this.form.controls['file'].setErrors(error.error.errors.file)
                }
                return of(null)
              }
              return throwError(error)
            }))
            .subscribe(async (res)=>{
              await this.feedbackService.register("Le fichier a été ajouté")
              this.router.navigate(["/manage/files/view"])
            })
        }
        reader.readAsDataURL(file);
      }

    }
  }

}
