import {Component, OnInit, ViewChild} from '@angular/core';
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

  @ViewChild('cursor') cursor: any;

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
  imcLabel = ""
  imcColor = ""
  imcDescription = ""
  calculate(){
    let w = parseInt(this.form.value.weight as any)
    let h = parseInt(this.form.value.height as any) / 100 // Because in centimeter
    this.imc  = w / (h * h)

    // Categorize the IMC in categories
    if(this.imc < 16.5){
      this.imcLabel = "Famine"
      this.imcColor = "danger"
      this.imcDescription = "Votre IMC est très bas, vous êtes en état de famine. Vous devriez consulter un médecin."
    }else if(this.imc < 18.5){
      this.imcLabel = "Maigreur"
      this.imcColor = "warning"
      this.imcDescription = "Votre IMC est bas, vous êtes en état de maigreur. Vous devriez consulter un médecin."
    }else if(this.imc < 25) {
      this.imcLabel = "Normal"
      this.imcColor = "success"
      this.imcDescription = "Votre IMC est normal, vous êtes en bonne santé."
    }else if(this.imc < 30) {
      this.imcLabel = "Surpoids"
      this.imcColor = "warning"
      this.imcDescription = "Votre IMC est élevé, vous êtes en surpoids. Vous devriez consulter un médecin."
    }else if(this.imc < 35) {
      this.imcLabel = "Obésité modérée"
      this.imcColor = "danger"
      this.imcDescription = "Votre IMC est très élevé, vous êtes en état d'obésité modérée. Vous devriez consulter un médecin."
    }else if(this.imc >= 40) {
      this.imcLabel = "Obésité sévère"
      this.imcColor = "danger"
      this.imcDescription = "Votre IMC est très élevé, vous êtes en état d'obésité sévère. Vous devriez consulter un médecin."
    }

    // Calculate the cursor index depending on the IMC following this linear gradient
    // 16.5 or lower -> 0%
    // 40 or higher -> 100%
    let cursorIndex = 0
    if(this.imc < 16.5){
      cursorIndex = 0
    }else if(this.imc > 40){
      cursorIndex = 100
    }else{
      cursorIndex = (this.imc - 16.5) / (40 - 16.5) * 100
    }
    setTimeout(()=>{
      console.log(this.cursor)
      this.cursor.nativeElement.style.left = `calc(${cursorIndex}% - 10px)`
    }, 100)

  }


  ngOnInit() {
  }

}
