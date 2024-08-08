import {BehaviorSubject, Observable} from "rxjs";


export default class StorageObservable<T> {
  private storageSubject: BehaviorSubject<T>
  private storageKey: string
  constructor(p_storageKey) {
    this.storageKey = p_storageKey
    const initialValue = JSON.parse(localStorage.getItem(this.storageKey) || 'null')
    this.storageSubject = new BehaviorSubject<T>(initialValue)
  }

  public getStorageObservable(): Observable<T>{
    return this.storageSubject.asObservable()
  }

  public updateStorage(newValue: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(newValue))
    this.storageSubject.next(newValue)
  }

  public getStorageValue(): T {
    return this.storageSubject.getValue()
  }
}