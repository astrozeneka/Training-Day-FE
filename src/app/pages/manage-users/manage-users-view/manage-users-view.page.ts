import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController, PopoverController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import {UserViewComponent} from "../../../components/entity-views/user-view/user-view.component";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-manage-users-view',
  templateUrl: './manage-users-view.page.html',
  styleUrls: ['./manage-users-view.page.scss'],
})
export class ManageUsersViewPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;
  jwtToken: string = undefined

  // Using state management rx
  filterSubject = new BehaviorSubject<any>({})
  filter$ = this.filterSubject.asObservable();

  // TODO, selected filter item
  f_privilege = undefined
  f_search = undefined

  // The loading
  loading: boolean = false


  searchControl:FormControl = new FormControl("")

  constructor(
    public contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feeedbackService:FeedbackService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private popoverController: PopoverController
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  async ngOnInit() {
    this.jwtToken = await this.contentService.storage.get('token')
    // this.loadData()

    // Manage search control (apply good practice)
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value)=>{
      this.f_search = value
      this.filterSubject.next({
        'f_search': this.f_search ?? '',
        'f_privilege': this.f_privilege ?? ''
      })
    })

    // The loading predicate
    this.loading = true
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }

  loadData() {
    /*this.entityList = null
    this.contentService.get('/users', this.pageOffset, this.searchControl.value, "f_email")
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))
      })*/
  }

  async showAddModal(){
    let modal = await this.modalController.create({
      component: UserViewComponent,
      componentProps: {}
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if (role == 'insert-success'){
      this.loadData()
    }
  }

  async showDeleteModal(id:number) {
    let alert = await this.alertController.create({
      header: "Supprimer l'élément",
      message: "Veuillez confirmer la suppression",
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: ()=>{ }
        },
        {
          text: 'Supprimer',
          cssClass: 'ion-color-danger',
          handler: ()=> {
            this.contentService.delete('/users', `${id}`)
              .subscribe(()=>{
                this.feeedbackService.registerNow("Vous avez supprimé un élémént")
                this.loadData()
              })
          }
        }
      ]
    })
    await alert.present();
  }

  async showDetailsModal(entity: any){
    let modal = await this.modalController.create({
      component: UserViewComponent,
      componentProps: {
        entity: entity
      }
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if(role == 'update-success'){
      // คิด่วาต้องเรียก
      this.loadData()
    }
  }

  getSafeImageURL(image:any): SafeUrl {
    // Assuming your base64 data is prefixed with "data:image/png;base64,"
    const imageSource = `data:${image.type};base64,${image.base64}`;
    return this.sanitizer.bypassSecurityTrustUrl(imageSource);
  }

  onAfterLoad({data, metainfo}){
    this.loading = false
    console.log("Load data", data, metainfo)
  }

  openChat(entity: any) {
    this.router.navigate(['/chat/details', entity.id])
  }

  getStaticUrl(suffix: string) {
    return this.contentService.rootEndpoint + '/' + suffix
  }

  filterBy(slug){
    this.filterSubject.next({
      'f_privilege': slug ?? ''
    })
    this.searchControl.setValue('')
    this.popoverController.dismiss()
  }
}
