import { FormGroup } from "@angular/forms";


export class FormComponent {
  protected displayedError:any = null
  protected form:any = null;
  protected manageValidationFeedback(error:any, slug:string, form:FormGroup<any>=undefined){
    if (!form) {
      form = this.form
    }
    console.log(error.error)
    if(error.error.errors[slug]){
      console.log(form)
      this.displayedError[slug] = error.error.errors[slug]
      form.controls[slug].setErrors(error.error.errors[slug])
      form.controls[slug].markAsTouched()
    } else {
      this.displayedError[slug] = undefined
    }
  }

  async readFile(file:any) {
    return new Promise((resolve) => {
      if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
          let base64 = reader.result as string
          let obj = {
            name: file.name,
            type: file.type,
            permalink: null,
            base64: base64
          }
          resolve(obj)
        }
        reader.readAsDataURL(file);
      }else{
        resolve(null)
      }
    })
  }
}
