import {Pipe, PipeTransform} from '@angular/core'

interface TextTruncateOptions {
  sliceStart: number;
  sliceEnd: number;
  prepend?: string;
  append?: string;
}

@Pipe({
  name: 'TextContentTruncate'
})

export class TextContentTruncate implements PipeTransform {
  transform(value: string, limit = 75, completeWords = false, ellipsis = ' [...]') {
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    if (value === undefined){return ''}
    return value.length > limit ? value.substr(0, limit) + ellipsis : value;
  }
}

