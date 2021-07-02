import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../../services/utils';
import {fuseAnimations} from '../../../@fuse/animations';

@Component({
    selector: 'app-two-card-demo',
    templateUrl: './two-card-demo.component.html',
    styleUrls: ['./two-card-demo.component.scss'],
    animations: fuseAnimations
})
export class TwoCardDemoComponent implements OnInit {
    editFlag = 0;
    detailId: any;
    titles = ['', ''];
    onSaving = false;

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private utils: Utils,
        private activatedRoute: ActivatedRoute,
    ) {
        this.detailId = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.detailId) {
            this.editFlag = 1;
        }
    }

    ngOnInit() {
    }

    onSaveClick() {

    }

    goBack() {

    }

}
