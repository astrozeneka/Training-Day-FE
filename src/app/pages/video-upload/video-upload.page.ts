import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.page.html',
  styleUrls: ['./video-upload.page.scss'],
})
export class VideoUploadPage extends FormComponent{

  fileControl = new FormControl(null, [Validators.required]);
  override form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'tags': new FormControl('', []),
    'category': new FormControl('', []),
    'file': this.fileControl
  });
  isFormLoading = false;
  valid = false;

  override displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
    'category': undefined,
  }

  constructor(
    private router:Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    super();
    this.form.valueChanges.subscribe((value)=>{
      this.valid = this.form.valid
    })
  }

  ngOnInit() {
  }

  submit(){
    this.isFormLoading = true
    let data:any = this.form.value
    if (data.category == 'training'){
      data.tags = 'training,' + data.tags
    }else if(data.category == 'boxing'){
      data.tags = 'boxing,' + data.tags
    }
    data.file_id = data.file.id
    this.contentService.post('/video', data)
      .pipe(finalize(()=>{
        this.isFormLoading = false
      }))
      .subscribe((response:any)=>{
        // Destroy all properties
        this.form.reset()
        this.fileControl.reset()
        if(response.id){
          this.feedbackService.register('Votre vidéo a été ajoutée avec succès', 'success')
          this.router.navigate(['/home'])
        }else{
          this.feedbackService.registerNow('Erreur lors de l\'ajout de la vidéo', 'danger')
        }
      })
  }

}
