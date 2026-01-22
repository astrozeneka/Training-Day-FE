import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SignupService {

    constructor(private http: HttpClient) {}

    validateEmail({email}: {email: string}): Observable<any> {
        return this.http.post(`${environment.apiEndpoint}/users/validate-email`, {email});
    }
}