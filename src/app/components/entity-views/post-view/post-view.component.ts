import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";
import {FormComponent} from "../../form.component";

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss'],
})
export class PostViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  override form: FormGroup = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'content': new FormControl('', [Validators.required]),
    'permalink': new FormControl('', [Validators.required]),
    'tags': new FormControl(''),
    'access': new FormControl(''),
    'type': new FormControl(''),
    'featured_media': new FormControl('') // TODO: include the featured media
  })
  override displayedError = {
    'title': undefined,
    'content': undefined,
    'permalink': undefined,
    'tags': undefined,
    'access': undefined,
    'type': undefined,
    'featured_media': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super()
  }

  ngOnInit() {
    this.form.patchValue(this.entity)
    console.log(this.form.value)
    this.loadData()
    // Additionnal patching value correction
  }

  loadData(){
    // เพราว่า input entity ไม่ครบ
    // ข้อมูลไฟล์ไม่อยู่
    if(this.entity){
      this.contentService.getOne('/posts/details', {'f_id': this.entity.id})
        .subscribe(data=>{
          console.log(data)
          this.entity = data
        })

    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async readFile(file:any) {
    return new Promise((resolve) => {
      if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
          let base64 = reader.result as string
          let obj = {
            name: file.name,
            type: file.type,
            permalink: null,
            base64: base64
          }
          resolve(obj)
        }
        reader.readAsDataURL(file);
      }else{
        resolve(null)
      }
    })
  }

  async confirm() {
    let fileInput: any = document.querySelector('input[name=featured_media]')
    let file = fileInput?.files[0]
    let fileContent = await this.readFile(file)
    let obj = this.form.value
    obj.id = this.entity?.id
    obj.featured_media = fileContent
    console.log(obj)
    if(this.entity == null) {
      console.log(obj)
      this.contentService.post('/posts', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'title')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'tags')
            this.manageValidationFeedback(error, 'access')
            this.manageValidationFeedback(error, 'type')
            this.manageValidationFeedback(error, 'featured_media')
          }
          return throwError(error)
        }))
        .subscribe(async (res)=>{
          console.log(res)
          await this.feedbackService.registerNow("Un élément a été ajouté")
          this.modalCtrl.dismiss(null, 'insert-success')
        })
    }else if(this.entity != null){
      console.log("Update")
      this.contentService.put('/posts', obj)
        .pipe(catchError((error) => {
          if (error.status == 422) {
            this.manageValidationFeedback(error, 'title')
            this.manageValidationFeedback(error, 'content')
            this.manageValidationFeedback(error, 'permalink')
            this.manageValidationFeedback(error, 'tags')
            this.manageValidationFeedback(error, 'access')
            this.manageValidationFeedback(error, 'type')
            this.manageValidationFeedback(error, 'featured_media')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.feedbackService.registerNow("Un élément a été mis à jour")
          this.modalCtrl.dismiss(null, 'update-success')
        })
    }

  }
}
