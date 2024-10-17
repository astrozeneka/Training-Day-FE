import { FormControl } from "@angular/forms";


export default class PasswordToggle {
    value:boolean = false
    constructor() {
    }
    public toggle(event, value) {
        this.value = value
        event.preventDefault()
    }
}