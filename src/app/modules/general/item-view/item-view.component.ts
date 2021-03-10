/// <reference types ="jquery"/>

import {Component, OnInit} from '@angular/core';
import {Note} from '../../../services/Store/NotesData.service';
import {iif, Subject} from 'rxjs';
import {StoreService} from '../../../services/store.service';
import {ActionService} from '../../../services/action.service';
import BreadcrumbsService, {Breadcrumb} from '../../../services/breadcrumbs.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CrudService} from '../../../services/crud.service';
import {pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {TagsService} from '../../../services/tags.service';
import {toArray, plainTextToHtmlWithBr} from '../../../../utils/utils1';
import {NoteModel, NoteWithTags} from '../../../models/note.model';
import {Autolinker} from 'autolinker';
import {domLoadUrls} from '../../../../utils/utils1';


@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.css'],
  providers: [BreadcrumbsService]
})


export class ItemViewComponent implements OnInit {
  public noteId: string;
  public note: Note;

  private unsubscribe$ = new Subject<void>();
  public breadcrumbs: ReadonlyArray<Breadcrumb>;


  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private crudService: CrudService,
    private tagsService: TagsService,
    private breadcrumbsService: BreadcrumbsService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      pluck('id'),
      tap((id: string) => this.noteId = id),
      switchMap(
        (id: string) => {
          return iif(
            () => !!id,
            this.action.GetNote(id),
            this.activatedRoute.queryParams
          )
        }
      ),
      takeUntil(this.unsubscribe$)
    ).subscribe(async (note: NoteModel) => {
      if(this.noteId){
        this.tagsService.mapTagsToNote(note).subscribe(
          (noteWithTags: NoteWithTags) => {
            const initialNote: Note = cloneDeep({...noteWithTags, tags: noteWithTags.tags || []});
            if(initialNote.url){
              initialNote.url = toArray(initialNote.url);
            }

            this.note = {
              title: initialNote.title,
              text: initialNote.text,
              tags: initialNote.tags,
              hasAvatar: initialNote.hasAvatar,
              url: initialNote.url,
              id: initialNote.id,
            };
            this.breadcrumbs = this.breadcrumbsService.work(initialNote.title, `/view/${initialNote.id}`);
          }
        );
      }

      // dynamic loading libraries if we need it
      if (note.files && note.files.length > 0) {
        await domLoadUrls(importUrls, { parentId: "bodyBegin" }).then(() => createGallery());
      }
    });

  }

  public displayText(text: string){
    return Autolinker.link(plainTextToHtmlWithBr(text));
  }
}

const importUrls: Array<string> = [
  'https://ntree.online/s/libs/jquery/3.5.1/min.js',
  'https://ntree.online/s/libs/magnific-popup/1.1.0/magnific-popup.css',
  'https://ntree.online/s/libs/magnific-popup/1.1.0/jquery.magnific-popup.min.js',
];

function createGallery(){
  // checking import JQuery and Magnific-Popup libs
  // if everything ok -> use Magnific for creating Gallery
  let countTrying = 0;

  const timer = setInterval(async () => {
    if (jQuery && jQuery('.popup-gallery').length && (jQuery as any).magnificPopup) {
      clearInterval(timer);
      (jQuery as any)('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
          enabled: true,
          navigateByImgClick: true,
          preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
          tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
        }
      });
    } else if (++countTrying > 100) {
      clearInterval(timer);
      alert('You have trouble with downloading libraries from server, restart page, please.')
    };
  }, 50);
}
