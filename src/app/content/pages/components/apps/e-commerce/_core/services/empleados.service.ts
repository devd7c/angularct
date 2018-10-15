import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { EmpleadoModel } from '../models/empleado.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class EmpleadosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new empleado to the server
	createEmpleado(empleado): Observable<EmpleadoModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(empleado);
		return this.http.post<EmpleadoModel>(API_URL + '/empleados', empleado, { headers: httpHeaders });
	}

	// READ
	getAllEmpleados(): Observable<EmpleadoModel> {
		return this.http.get<EmpleadoModel>(API_URL + '/empleados');
	}

	getEmpleadoById(idEmpleado: number): Observable<EmpleadoModel> {
		return this.http.get<EmpleadoModel>(API_URL + `/empleados/${idEmpleado}`);
	}

	// Server should return filtered/sorted result
	findEmpleados(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			// console.log(queryParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/empleados/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the empleado on the server
	updateEmpleado(empleado: EmpleadoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(empleado);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/empleados/${empleado.id}`, empleado, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForEmpleado(empleados: EmpleadoModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			empleadosForUpdate: empleados,
			newStatus: status
		};
		const url = API_URL + '/empleados/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the empleado from the server
	deleteEmpleado(idEmpleado: number): Observable<EmpleadoModel> {
		const url = `${API_URL}/empleados/${idEmpleado}`;
		return this.http.delete<EmpleadoModel>(url);
	}

	deleteEmpleados(ids: number[] = []): Observable<any> {
		const url = API_URL + '/empleados/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idEmpleadosForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


