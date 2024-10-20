import { BehaviorSubject } from "rxjs";
import IMessage from "../models/IMessages";


export default class MessageSubject extends BehaviorSubject<IMessage[]>{
    
    constructor(initialValue: IMessage[]) {
        super(initialValue);
    }
}