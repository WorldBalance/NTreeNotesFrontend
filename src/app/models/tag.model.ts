import { Item } from '../../../in/Api';
import {ItemType} from './note.model';

export interface TagModel extends Item {
  id: string;
  title: string;
  type: ItemType.tag;
  checked?: boolean
}
