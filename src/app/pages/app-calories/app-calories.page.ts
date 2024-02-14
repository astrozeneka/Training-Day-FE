import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {NavigationEnd, Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";

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
    'sex': new FormControl('', [Validators.required])
  })
  override displayedError = {
    'weight': undefined,
    'height': undefined,
    'age': undefined,
    'sex': undefined,

    'duration': undefined
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
      if (event instanceof NavigationEnd){
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
  calory_to_consume = {
    sedentary: 0,
    light: 0,
    moderate: 0,
    intense: 0,
    extreme: 0
  }

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
    console.log(`Calories à consommer de base: ${base}`)
    this.calory_to_consume.sedentary = base * 1.2
    this.calory_to_consume.light = base * 1.375
    this.calory_to_consume.moderate = base * 1.55
    this.calory_to_consume.intense = base * 1.725
    this.calory_to_consume.extreme = base * 1.9
  }

}
