import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of  } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { ContratoModel } from '../models/contrato.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class ContratosService {
    httpOptions = this.httpUtils.getHTTPHeaders();
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

    getAllContratos(): Observable<ContratoModel> {
		return this.http.get<ContratoModel>(API_URL + `/contratos`);
	}
	// CREATE
	// READ
	// UPDATE
	// DELETE
}
