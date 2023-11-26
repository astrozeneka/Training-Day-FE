import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";
import {FormComponent} from "../../form.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-goal-view',
  templateUrl: './goal-view.component.html',
  styleUrls: ['./goal-view.component.scss'],
})
export class GoalViewComponent extends FormComponent implements OnInit {
  @Input() entity:null|any = null;

  goalGroups: any[] = []

  override form:FormGroup = new FormGroup({
    'label': new FormControl('', [Validators.required]),
    'goal_group_id': new FormControl(''),
    'goal_group_label': new FormControl('')
  })

  override displayedError = {
    'label': undefined,
    'goal_group_id': undefined, // ไม่ค่อยใช้
    'goal_group_label': undefined
  }

  constructor(
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router:Router
  ) {
    super()
    console.log("Should Load data")
    this.loadData()
    router.events.subscribe((res)=>{
      // Todo: Find a better way to update the content
      console.log("OK")
    })
  }

  loadData(){
    console.log("Load data")
    this.contentService.get('/goal-groups').subscribe(([data, metaInfo])=>{
      this.goalGroups = data as unknown as Array<any>
      console.log(this.goalGroups) // Todo: remove this line
    })
  }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    this.contentService.post('/goals', this.form.value)
      .pipe(catchError((error)=>{
        if(error.status === 422){
          this.manageValidationFeedback(error, 'label')
          this.manageValidationFeedback(error, 'goal_group_label')
        }
        return throwError(error)
      }))
      .subscribe(async (res)=>{
        await this.feedbackService.registerNow("Un objectif a été ajouté")
        this.modalCtrl.dismiss(null, 'update-success')
      })
  }

}
