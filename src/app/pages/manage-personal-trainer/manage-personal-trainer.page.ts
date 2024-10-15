import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl} from "@angular/forms";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {catchError, finalize} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-manage-personal-trainer',
  templateUrl: './manage-personal-trainer.page.html',
  styleUrls: ['./manage-personal-trainer.page.scss'],
})
export class ManagePersonalTrainerPage extends FormComponent implements OnInit {
  // Some properties from FormComponent are unused
  isFormLoading = false;
  searchUserControl: FormControl = new FormControl('');
  searchUserResult: Array<any> = null;
  selectedUser: any = null;

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
  }

  searchUser(event:any){
    console.log(this.searchUserControl.value)
    this.contentService.getCollection('/users', 0, {
      f_search: this.searchUserControl.value
    }).subscribe(({data, metainfo})=>{
      this.searchUserResult = data
    })
    event.preventDefault()
  }

  selectUser(event: any, user:any){
    this.selectedUser = user
    let reduced = this.selectedUser.grouped_perishables.reduce((acc:any, item:any)=>{
      acc[item.slug] = item
      return acc
    }, {});
    console.log(reduced)
    if (reduced.hasOwnProperty('personal-trainer')) {
      this.selectedUser.personalTrainer = reduced['personal-trainer']
    }
    event.preventDefault()
  }

  submit(event:any){
    this.isFormLoading = true;
    this.contentService.post('/perishables/decrement', {
      user_id: this.selectedUser.id,
      perishable_slug: 'personal-trainer'
    }).pipe(finalize(()=>this.isFormLoading = false))
      .subscribe((data)=>{
      this.feedbackService.register(data['message'], 'success')
      this.router.navigate(['/home'])
      this.flushComponent()
    });
  }

  flushComponent(){
    this.isFormLoading = false;
    this.searchUserControl.setValue('')
    this.searchUserResult = null
    this.selectedUser = null
  }

}
