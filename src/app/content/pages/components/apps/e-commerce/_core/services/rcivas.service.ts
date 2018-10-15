import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { RcivaModel } from '../models/rciva.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class RcivasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new rciva to the server
	createRciva(rciva): Observable<RcivaModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(rciva);
		return this.http.post<RcivaModel>(API_URL + '/rcivas', rciva, { headers: httpHeaders });
	}

	// READ
	getAllRcivas(): Observable<RcivaModel> {
		return this.http.get<RcivaModel>(API_URL);
	}

	getRcivaById(idRciva: number): Observable<RcivaModel> {
		return this.http.get<RcivaModel>(API_URL + `/rcivas/${idRciva}`);
	}

	// Server should return filtered/sorted result
	findRcivas(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			console.log(queryParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/rcivas/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the rciva on the server
	updateRciva(rciva: RcivaModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(rciva);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/rcivas/${rciva.id}`, rciva, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForRciva(rcivas: RcivaModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			rcivasForUpdate: rcivas,
			newStatus: status
		};
		const url = API_URL + '/rcivas/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the rciva from the server
	deleteRciva(idRciva: number): Observable<RcivaModel> {
		const url = `${API_URL}/rcivas/${idRciva}`;
		return this.http.delete<RcivaModel>(url);
	}

	deleteRcivas(ids: number[] = []): Observable<any> {
		const url = API_URL + '/rcivas/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idRcivasForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


