import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {NavigationEnd, Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";

@Component({
  selector: 'app-app-imc',
  templateUrl: './app-imc.page.html',
  styleUrls: ['./app-imc.page.scss'],
})
export class AppImcPage extends FormComponent {
  user: any = null

  override form = new FormGroup({
    'weight': new FormControl('', [Validators.required]),
    'height': new FormControl('', [Validators.required]),
  })

  override displayedError = {
    'weight': undefined,
    'height': undefined,
  }
  loaded = false;
  physicalValidated = false;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
    super()
    router.events.subscribe(async(event: any)=>{
      if (event instanceof NavigationEnd) {
        this.user = await this.contentService.storage.get('user')
        if(this.user){
          this.contentService.getOne(`/users/body/${this.user.id}`, '')
            .subscribe(v=>{
              console.debug(`Load user data from server ${JSON.stringify(v)}`)
              this.form.patchValue(v)
              this.loaded = true
            })
        }
        this.imc = undefined
        this.form.reset()
      }
    })
  }

  loadData(){
    this.contentService.storage.get('user')
      .then((u)=>{
        this.user = u
        this.contentService.getOne(`/users/body/${u.id}`, '')
          .subscribe(v=>{
            console.debug(`Load user data from server ${JSON.stringify(v)}`)
            this.form.patchValue(v)
            this.loaded = true
          })
      })
  }

  validatePhysical(){
    // Check if one of the value are empty
    if(this.form.value.weight == '' || this.form.value.height == ''){
      this.feedbackService.registerNow("Veuillez entrez correctement votre poids et votre taille", "danger")
      return
    }
    if(this.user){
      let obj:any = this.form.value
      obj.id = this.user.id
      this.contentService.put('/users', obj)
        .subscribe((u)=>{
          this.physicalValidated = true;
          this.calculate()
        })
    }else{
      this.calculate()
    }
  }

  imc:any = undefined

  calculate(){
    let w = parseInt(this.form.value.weight as any)
    let h = parseInt(this.form.value.height as any) / 100 // Because in centimeter
    this.imc  = w / (h * h)
  }


  ngOnInit() {
  }

}
