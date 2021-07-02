import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-payment-record-detail',
  templateUrl: './payment-record-detail.component.html',
  styleUrls: ['./payment-record-detail.component.scss']
})
export class PaymentRecordDetailComponent implements OnInit {
    options: FormGroup;
    struts: string;
  constructor() {
      this.options = new FormBuilder().group({
          reason:  new FormControl({value: null}, [Validators.required] ),
      });
  }

  ngOnInit() {
      this.struts = '已付款';
  }

}
