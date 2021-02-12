import {Injectable} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {TagModel} from '../models/tag.model';
import {CrudService} from './crud.service';
import {find, map, shareReplay, switchMap, take, takeUntil, tap, toArray} from 'rxjs/operators';
import {ItemType, NoteModel, NoteWithTags} from '../models/note.model';
import {StoreService} from './store.service';
import {Tag} from "../../../in/Api";
import {Note} from "./Store/NotesData.service";

@Injectable({providedIn: 'root'})
export class TagsService {

  private tags$ = new ReplaySubject<TagModel[]>();
  private tags: TagModel[] = [];

  constructor(private crudService: CrudService, private store: StoreService) {
    this.downloadData();
  }

  public downloadData(): void {
    this.crudService.getTags().pipe().subscribe((tags: TagModel[]) => {
      this.store.data.tags.tagsArray = tags;
      this.tags$.next(tags);
    });
  }

  public getTags(): Observable<TagModel[]> {
    return this.tags$.asObservable().pipe(
      tap((tags: TagModel[]) => this.tags = tags),
    );
  }

  public addTag(tag: string): Observable<string> {
    const tags$ = this.crudService.addTag(tag).pipe(shareReplay(1));
    tags$.subscribe((addedTag: string) => {
      const updatedTags = this.tags;
      updatedTags.unshift({id: addedTag, title: tag, type: ItemType.tag});
      this.tags$.next(updatedTags);
    });
    return tags$;
  }

  public deleteTag(id: string): void {
    const tags = this.tags;
    const deletedTag = tags.findIndex((tag: TagModel) => tag.id === id);
    tags.splice(deletedTag, 1);
    this.tags$.next(tags);
  }

  public mapTagsToNote(item: NoteModel ): Observable<NoteWithTags>{
    return this.getTags().pipe(
      map((tags: TagModel[]) => {
        let tagsData = [];
        if(item.tags) {
          tagsData = item.tags.map((itemTagId: string) => {
            return tags.find((tag: Tag) => tag.id === itemTagId) || {title: 'ошибка системы! Тег был удален!'} as TagModel;
          });
        }
        return {...item, tags: tagsData};
      })
    )
  }
}
