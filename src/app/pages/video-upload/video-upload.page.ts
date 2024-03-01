import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.page.html',
  styleUrls: ['./video-upload.page.scss'],
})
export class VideoUploadPage extends FormComponent{

  override form = new FormGroup({
    'title': new FormControl('', []),
    'description': new FormControl('', []),
  });

  override displayedError = {
    'title': undefined,
    'description': undefined,
  }

  constructor(
  ) {
    super();
  }

  ngOnInit() {
  }

  submit(){

  }

}
