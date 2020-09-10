import { Item } from "../../../in/Api";

export interface TagModel extends Item {
  id: string;
  title: string;
  type: 'tag';
}
