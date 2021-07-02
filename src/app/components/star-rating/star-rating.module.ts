import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StarRatingComponent} from './star-rating.component';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../root.module';



@NgModule({
  declarations: [StarRatingComponent],
  exports: [StarRatingComponent],
  imports: [
      CommonModule ,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      MatDialogModule,
      TranslateModule,
      MatCheckboxModule,
      MatCardModule,
  ]
})
export class StarRatingModule { }
