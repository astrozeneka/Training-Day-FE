

export class FormComponent {
  protected displayedError:any = null
  protected form:any = null;
  protected manageValidationFeedback(error:any, slug:string){
    console.log(this.displayedError)
    console.log(this.form)
    if(error.error.errors[slug]){
      this.displayedError[slug] = error.error.errors[slug]
      this.form.controls[slug].setErrors(error.error.errors[slug])
      this.form.controls[slug].markAsTouched()
    } else {
      this.displayedError[slug] = undefined
    }
  }
}
