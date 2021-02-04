import { StaticTag, mapStaticTagReversed } from '../../../../in/StaticTag';

export function isStaticTag(tag) {
  return mapStaticTagReversed[tag] ? true : false
}


export { StaticTag, mapStaticTagReversed } from '../../../../in/StaticTag';
