export class QueryResultsModel {
	// fields
	data: any[];
	meta: any;
	pagination: any;
	items: any[];
	totalCount: number;
	total: number;
	currentPage: number;
	errorMessage: string;

	constructor(_items: any[] = [], _data: any[] = [], _errorMessage: string = '') {
		this.items = _items;
		this.data = _data;
		this.totalCount = _items.length;
		this.total = _data.length;
		this.currentPage = _data.length;
	}
}
