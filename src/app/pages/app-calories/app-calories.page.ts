import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../content.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-app-calories',
  templateUrl: './app-calories.page.html',
  styleUrls: ['./app-calories.page.scss'],
})
export class AppCaloriesPage extends FormComponent implements OnInit{
  user: any = null

  override form = new FormGroup({
    'weight': new FormControl('', [Validators.required]),
    'height': new FormControl('', [Validators.required])
  })
  override displayedError = {
    'weight': undefined,
    'height': undefined,

    'duration': undefined
  }
  loaded = false;
  physicalValidated = false;

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {
    super()
    this.loadData();
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
    let obj:any = this.form.value
    obj.id = this.user.id
    this.contentService.put('/users', obj)
      .subscribe((u)=>{
        console.log("updated")
        this.physicalValidated = true;
      })
  }

}
