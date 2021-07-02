import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarketingManagementServiceService {

  constructor() { }
}


export class MarketListEntity{
  constructor(
     id: string,
     title: string,
     type: string,
     IssuingVoucher: string,
     startTime: string,
     endTime: string,
     EnginePush: string,
     state: string,
     upPerson: string,
     upTime: string,
     operation: string,
  ){}
}

export class MarketingHeaderEntity{
    constructor(
        id: string,
        title: string,
        type: string,
        IssuingVoucher: string,
        startTime: string,
        endTime: string,
        EnginePush: string,
        state: string,
        upPerson: string,
        upTime: string,
        operation: string,
    ){}
}
