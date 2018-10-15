import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { MultaModel } from '../models/multa.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class MultasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new multa to the server
	createMulta(multa): Observable<MultaModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(multa);
		return this.http.post<MultaModel>(API_URL + '/multas', multa, { headers: httpHeaders });
	}

	// READ
	getAllMultas(): Observable<MultaModel[]> {
		return this.http.get<MultaModel[]>(API_URL + '/multas');
	}

	getMultaById(idMulta: number): Observable<MultaModel> {
		return this.http.get<MultaModel>(API_URL + `/multas/${idMulta}`);
	}

	// Server should return filtered/sorted result
	findMultas(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// console.log(queryParams);
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		// console.log(httpParams);
		// const url = API_MULTAS_URL + '/find';
		const url = API_URL + '/multas/find/1';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the multa on the server
	updateMulta(multa: MultaModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(multa);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/multas/${multa.id}`, multa, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForMulta(multas: MultaModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			multasForUpdate: multas,
			newStatus: status
		};
		const url = API_URL + '/multas/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the multa from the server
	deleteMulta(idMulta: number): Observable<MultaModel> {
		const url = `${API_URL}/multas/${idMulta}`;
		return this.http.delete<MultaModel>(url);
	}

	deleteMultas(ids: number[] = []): Observable<any> {
		const url = API_URL + '/multas/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idMultasForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


