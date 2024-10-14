import {BehaviorSubject, Observable} from "rxjs";


export default class StorageObservable<T> {
  private storageSubject: BehaviorSubject<T>
  private storageKey: string
  constructor(p_storageKey) {
    this.storageKey = p_storageKey
    const initialValue = JSON.parse(localStorage.getItem(this.storageKey))
    this.storageSubject = new BehaviorSubject<T>(initialValue)
  }

  public getStorageObservable(): Observable<T>{
    return this.storageSubject.asObservable()
  }

  public gso$(): Observable<T>{
    return this.getStorageObservable()
  }

  public updateStorage(newValue: T): void {
    // hash the old value and the new value, then compare
    // if they are the same, then do not update
    let oldValue = this.storageSubject.getValue()
    if(JSON.stringify(oldValue) != JSON.stringify(newValue)) {
      localStorage.setItem(this.storageKey, JSON.stringify(newValue))
      this.storageSubject.next(newValue)
      // console.log("Fire " + this.storageKey + " update")
    }else{
      //console.log("No need to update " + this.storageKey)
    }
  }

  public getStorageValue(): T {
    return this.storageSubject.getValue()
  }
}