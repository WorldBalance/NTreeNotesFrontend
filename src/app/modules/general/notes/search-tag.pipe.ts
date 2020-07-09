import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'serch_Tag_Pipe'
})

export class SearchTagPipe implements PipeTransform {
  transform(tags, search = ''){
    if (!search.trim()) {
      return tags;
    }
    return tags.filter(tag => {
        return tag.title.toLowerCase().includes(search.toString().toLowerCase());
    });
  }
}
