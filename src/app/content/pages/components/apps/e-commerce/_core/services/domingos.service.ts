import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { DomingoModel } from '../models/domingo.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class DomingosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new domingo to the server
	createDomingo(domingo): Observable<DomingoModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(domingo);
		return this.http.post<DomingoModel>(API_URL + '/domingos', domingo, { headers: httpHeaders });
	}

	// READ
	getAllDomingos(): Observable<DomingoModel[]> {
		return this.http.get<DomingoModel[]>(API_URL + '/domingos');
	}

	getDomingoById(idDomingo: number): Observable<DomingoModel> {
		return this.http.get<DomingoModel>(API_URL + `/domingos/${idDomingo}`);
	}

	// Server should return filtered/sorted result
	findDomingos(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			// console.log(httpParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/domingos/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the domingo on the server
	updateDomingo(domingo: DomingoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(domingo);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/domingos/${domingo.id}`, domingo, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForDomingo(domingos: DomingoModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			domingosForUpdate: domingos,
			newStatus: status
		};
		const url = API_URL + '/domingos/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the domingo from the server
	deleteDomingo(idDomingo: number): Observable<DomingoModel> {
		const url = `${API_URL}/domingos/${idDomingo}`;
		return this.http.delete<DomingoModel>(url);
	}

	deleteDomingos(ids: number[] = []): Observable<any> {
		const url = API_URL + '/domingos/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idDomingosForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


