import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";

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
    'file': this.fileControl
  });
  valid = false;

  override displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
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
    let data:any = this.form.value
    data.file_id = data.file.id
    this.contentService.post('/video', data)
      .subscribe((response:any)=>{
        console.log('response')
        // If the return object has an id, make it success
        if(response.id){
          this.feedbackService.register('Votre vidéo a été ajoutée avec succès', 'success')
          this.router.navigate(['/home'])
        }else{
          this.feedbackService.registerNow('Erreur lors de l\'ajout de la vidéo', 'danger')
        }
      })
  }

}
