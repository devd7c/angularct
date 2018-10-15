import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { BonoModel } from '../models/bono.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class BonosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new bono to the server
	createBono(bono): Observable<BonoModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(bono);
		return this.http.post<BonoModel>(API_URL + '/bonos', bono, { headers: httpHeaders });
	}

	// READ
	getAllBonos(): Observable<BonoModel[]> {
		return this.http.get<BonoModel[]>(API_URL + '/bonos');
	}

	getBonoById(idBono: number): Observable<BonoModel> {
		return this.http.get<BonoModel>(API_URL + `/bonos/${idBono}`);
	}

	// Server should return filtered/sorted result
	findBonos(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			// console.log(httpParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/bonos/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the bono on the server
	updateBono(bono: BonoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(bono);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/bonos/${bono.id}`, bono, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForBono(bonos: BonoModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			bonosForUpdate: bonos,
			newStatus: status
		};
		const url = API_URL + '/bonos/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the bono from the server
	deleteBono(idBono: number): Observable<BonoModel> {
		const url = `${API_URL}/bonos/${idBono}`;
		return this.http.delete<BonoModel>(url);
	}

	deleteBonos(ids: number[] = []): Observable<any> {
		const url = API_URL + '/bonos/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idBonosForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


