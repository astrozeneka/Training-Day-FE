import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', Validators.required)
  })
  constructor(
  ) { }

  ngOnInit() {
    console.log(document.body.classList)
  }

  submit(){

  }

  getLogoSrc(){
    let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    if(darkMode)
      return "assets/logo-dark.png"
    else
      return "assets/logo-light.png"
  }



  protected readonly document = document;
}
