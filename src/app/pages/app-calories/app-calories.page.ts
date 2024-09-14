import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {Browser} from "@capacitor/browser";
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-app-calories',
  templateUrl: './app-calories.page.html',
  styleUrls: ['./app-calories.page.scss'],
})
export class AppCaloriesPage extends FormComponent implements OnInit{
  user: any = null

  override form = new FormGroup({
    'weight': new FormControl('', [Validators.required]),
    'height': new FormControl('', [Validators.required]),
    'age': new FormControl('', [Validators.required]),
    'sex': new FormControl('', [Validators.required]),
    'activity': new FormControl('', [Validators.required])
  })
  override displayedError = {
    'weight': undefined,
    'height': undefined,
    'age': undefined,
    'sex': undefined,
    'activity': undefined,

    'duration': undefined
  }
  loaded = false;
  physicalValidated = false;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private platform: Platform
  ) {
    super()
    router.events.subscribe(async(event: any)=>{
      if (event instanceof NavigationEnd && event.url == '/app-calories'){
        this.user = await this.contentService.storage.get('user')
        if(this.user){
          this.contentService.getOne(`/users/body/${this.user.id}`, '')
            .subscribe(v=>{
              this.form.patchValue(v)
              this.loaded = true
            })
        }
        this.form.reset()
        this.calory_to_consume = {
          sedentary: 0,
          light: 0,
          moderate: 0,
          intense: 0,
          extreme: 0
        }
        this.physicalValidated = false
      }else if(event instanceof NavigationStart){
        this.form.reset()
        this.calory_needed = undefined
      }
    })
  }

  loadData(){
    this.contentService.storage.get('user')
      .then((u)=>{
        this.user = u
        this.contentService.getOne(`/users/body/${u.id}`, '')
          .subscribe(v=>{
            this.form.patchValue(v)
            this.loaded = true
          })
      })
  }

  ngOnInit() {
  }

  validatePhysical(){
    // Check if one of the value are empty
    if(this.form.value.weight == null || this.form.value.height == null || this.form.value.age == null || this.form.value.sex == null){
      this.feedbackService.registerNow("Veuillez entrez correctement vos informations", "danger")
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
      this.physicalValidated = true;
      this.calculate()
    }
  }

  // Quantité de calories à consommer
  /**
   * @deprecated will be removed in the future
   */
  calory_to_consume = {
    sedentary: 0,
    light: 0,
    moderate: 0,
    intense: 0,
    extreme: 0
  }
  calory_needed:any = undefined

  calculate(){
    let base = 0
    if (this.form.value.sex == "male"){
      base = 10 * parseInt(this.form.value.weight as any)
        + 6.25 * parseInt(this.form.value.height as any)
        - 5 * parseInt(this.form.value.age as any) + 5
    } else if (this.form.value.sex == "female"){
      base = 10 * parseInt(this.form.value.weight as any)
        + 6.25 * parseInt(this.form.value.height as any)
        - 5 * parseInt(this.form.value.age as any) - 161
    }

    let multiplicator = 1
    switch (this.form.value.activity){
      case "sedentary":
        multiplicator = 1.2
        break
      case "light":
        multiplicator = 1.375
        break
      case "moderate":
        multiplicator = 1.55
        break
      case "intense":
        multiplicator = 1.725
        break
      case "extreme":
        multiplicator = 1.9
        break
    }
    this.calory_needed = base * multiplicator

    this.calory_to_consume.sedentary = base * 1.2
    this.calory_to_consume.light = base * 1.375
    this.calory_to_consume.moderate = base * 1.55
    this.calory_to_consume.intense = base * 1.725
    this.calory_to_consume.extreme = base * 1.9
  }


  openExternal(url){
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }
}
