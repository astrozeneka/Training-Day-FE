import { Injectable } from '@angular/core';
import StoredData from './components-submodules/stored-data/StoredData';
import { ContentService } from './content.service';
import { filter, merge, Observable, Subject } from 'rxjs';

export interface OnboardingData {
  age: any,
  height: any,
  weight: any,
  sex: any,

  // Goals

  // Sleep
  dailySleepHours: any,

  // Food and waters
  dailyMeals,
  dailyWater,

  // Activity
  activity
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  // Temporary user data
  onboardingData: StoredData<OnboardingData>
  onboardingDataSubject: Subject<OnboardingData>
  onboardingData$: Observable<OnboardingData>

  constructor(
    private cs: ContentService
  ) { 
    this.onboardingData = new StoredData<OnboardingData>('onboardingData', this.cs.storage)
    this.onboardingDataSubject = new Subject<OnboardingData>()
    this.onboardingData$ = this.onboardingDataSubject.asObservable()
  }

  /**
   * Load onboarding temporary data
   */
  onOnboardingData(/* fromCache: boolean = true */):Observable<OnboardingData>{
    let additionalEvents$ = new Subject<OnboardingData>()

    this.onboardingData.get().then((data:OnboardingData) => {
      this.onboardingDataSubject.next(data)
    })

    let output$ = merge(this.onboardingData$, additionalEvents$)
    output$.pipe(filter((data:OnboardingData) => data !== undefined));
    return output$
  }

  /**
   * Save onboarding temporary data
   */
  saveOnboardingData(data:OnboardingData):Promise<any>{
    return new Promise((resolve) => {
      this.onboardingData.get().then(oldData => {
        // Merge
        let newData = {...oldData, ...data}
        this.onboardingData.set(newData).then(() => {
          this.onboardingDataSubject.next(newData)
          resolve(newData)
        })
      })
    })
  }

}
