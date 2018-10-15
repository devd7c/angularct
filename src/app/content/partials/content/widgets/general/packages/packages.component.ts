import { Component, Inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as _ from 'lodash';

import { LaboralsService } from '../../../../../pages/components/apps/e-commerce/_core/services/laborals.service';
import { LaboralModel } from '../../../../../pages/components/apps/e-commerce/_core/models/laboral.model';

@Component({
  selector: 'm-packages',
  templateUrl: './packages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesComponent implements OnInit {
	public laboral: LaboralModel;
	public laboralSi;
  public empresaId;

  constructor(
    private laboralsService: LaboralsService) {}

  ngOnInit() {
    this.empresaId = 1;
		this.laboralsService.getLaboralsByIdEmpresa(this.empresaId).subscribe(res => {
			this.laboral = res.data['0'];
      this.generateData(this.laboral);
      console.log(this.laboral.si);
		});
  }
  refresh() {

  }
  generateData(laboral: LaboralModel) {
    laboral = laboral;
		this.laboralSi = laboral.si.toString();
  }
}
