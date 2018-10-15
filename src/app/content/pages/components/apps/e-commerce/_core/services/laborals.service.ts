import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of  } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { LaboralModel } from '../models/laboral.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class LaboralsService {
    httpOptions = this.httpUtils.getHTTPHeaders();
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

	getLaboralsByIdEmpresa(empresaId: number): Observable<LaboralModel> {
		return this.http.get<LaboralModel>(API_URL + `/empresas/${empresaId}/laborals`);
	}

	getActiveLaboralByIdEmpresa(empresaId: number): Observable<LaboralModel> {
		return this.http.get<LaboralModel>(API_URL + `/laborals/${empresaId}/getactive`);
	}

    getAllLaborals(): Observable<LaboralModel> {
		return this.http.get<LaboralModel>(API_URL + `/laborals`);
	}

	getLaboralById(laboralId: number): Observable<LaboralModel> {
		return this.http.get<LaboralModel>(API_URL + `/laborals/${laboralId}`);
	}

	// CREATE =>  POST: add a new product laboral to the server
	createLaboral(laboral): Observable<LaboralModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(laboral);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<LaboralModel>(API_URL + '/laborals', laboral, { headers: httpHeaders });
	}

	// Server should return sorted/filtered laborals and merge with items from state
	findLaborals(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<LaboralModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/laborals/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<LaboralModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product laboral
	updateLaboral(laboral: LaboralModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(laboral);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/laborals/${laboral.id}`, laboral, { headers: httpHeaders });
	}

	// DELETE => delete the product laboral
	deleteLaboral(laboral: LaboralModel): Observable<LaboralModel> {
		// console.log(laboral.id);
		const url = `${API_URL}/laborals/${laboral.id}`;
		return this.http.delete<LaboralModel>(url);
	}
}


