import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import {NgbProgressbarConfig} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'm-recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentActivitiesComponent implements OnInit, AfterViewInit {
  nivel: number = 360000;
/**
      nivel1: 10000,
      nivel2: 35000,
      nivel3: 90000,
      nivel4: 180000,
      nivel5: 360000,
      nivel6: 700000,
      nivel7: 1300000,
      nivel8: 2000000,
      nivel9: 3000000,
      nivel10: 5000000,
 */
  @ViewChild('n1') nivel1: NgbTooltip;
  @ViewChild('n2') nivel2: NgbTooltip;
  @ViewChild('n3') nivel3: NgbTooltip;
  @ViewChild('n4') nivel4: NgbTooltip;
  @ViewChild('n5') nivel5: NgbTooltip;
  @ViewChild('n6') nivel6: NgbTooltip;
  @ViewChild('n7') nivel7: NgbTooltip;
  @ViewChild('n8') nivel8: NgbTooltip;
  @ViewChild('n9') nivel9: NgbTooltip;
  @ViewChild('n10') nivel10: NgbTooltip;
  constructor(config: NgbProgressbarConfig) {
    /*if (this.nivel === 10000) {
      config.max = 35000;
      config.striped = true;
      config.animated = true;
      config.type = 'success';
      config.height = '20px';
    }*/
  }
  ngOnInit() {

  }
  ngAfterViewInit(): void {
    this.nivel1.open();
    this.nivel2.open();
    this.nivel3.open();
    this.nivel4.open();
    this.nivel5.open();
    this.nivel6.open();
    this.nivel7.open();
    this.nivel8.open();
    this.nivel9.open();
    this.nivel10.open();

	}
}
