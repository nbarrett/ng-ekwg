import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "filter"})
export class SearchFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }

    if (!searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();
    return items.filter(item => JSON.stringify(item).toLowerCase().includes(searchText));
  }
}
