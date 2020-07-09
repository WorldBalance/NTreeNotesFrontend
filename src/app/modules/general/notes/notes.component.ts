import { Component, OnInit, HostBinding} from '@angular/core';
import { fromTopAnimation } from '../../../animations/from-top.animation';
import { StoreService } from '../../../services/store.service';
import { ActionService } from '../../../services/action.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { trigger, style, query, transition, stagger, animate } from '@angular/animations';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  providers: [],
  animations: [fromTopAnimation,
    trigger('tagAnimation', [
      transition('void => *', [
        query('div', style({transform: 'translatex(-100%)'})),
        query('div',
          stagger('15ms', [
            animate('220ms', style ({transform: 'translateX(0)'}))
          ])
        )
      ])
    ]),
    trigger('noteAnimation', [
      transition('void => *', [
        query('div', style({transform: 'translatex(-100%)'})),
        query('div',
          stagger('10ms', [
            animate('250ms ease-in', style ({transform: 'translateX(0)'}))
          ])
        )
      ])
    ])
  ]
})
export class NotesComponent implements OnInit {
  routerparams_subscriber$;

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router,
    private route: ActivatedRoute
  ){

  }

  public GetMoreNotesData() {
    if (this.store.data.notes.downloadMore){ this.action.GetNotes(); }
  }

  ngOnInit(){
    this.routerparams_subscriber$ = this.route.queryParams.subscribe((params: Params) => {
      this.store.data.notes.searchTags = new Set();
      if (params['search']){this.store.data.notes.searchText = params['search']}
      if (params['tags']){
        let data = [];
        data = params['tags'].split('-');
        data.shift();
        this.store.data.notes.searchTags = new Set();
        data.forEach((el, index) => {
          this.store.data.notes.searchTags.add(el);
        });
      }
      const refresh = true;
      this.action.GetNotes(refresh);
    });
    this.setupSearchNotesDebouncer();
  }

  ngOnDestroy(){
    this.routerparams_subscriber$.unsubscribe();
  }

  private searchNoteDecouncer$: Subject<string> = new Subject();

  public onSearchNoteInputChange(term: string): void {
    this.searchNoteDecouncer$.next(term);
  }

  private async setupSearchNotesDebouncer(){
    this.searchNoteDecouncer$.pipe(
      debounceTime(700),
      distinctUntilChanged()
    ).subscribe(async (term: string) => {
      this.store.data.notes.searchText = term;
      await this.refresh_url_search();
      //this.action.GetNotes();
    });
  }

  AddTag(text){
    this.action.AddTag(text);
  }

  DeleteTag(id, event){
    const r = confirm("Данный тег будет удалён! Вы уверены? (тут конечно будет позже что-то по-красивее :))) )");
    if (r === true) {
      event.stopPropagation();
      this.action.DeleteTag(id);
      this.store.data.notes.searchTags.delete(id);
      this.refresh_url_search();
    }
  }

  AddNote(){
    this.router.navigate(['/create']);
  }

  async FilterNotesTag(tagId){
    if (this.store.data.notes.searchTags.has(tagId)){this.store.data.notes.searchTags.delete(tagId); }
    else{this.store.data.notes.searchTags.add(tagId); }
    await this.refresh_url_search();

    //this.crudService.FilterNotes(this.Search).subscribe(data => {this.Notes=data;});
    //this.action.GetNotes();
  }

  NoteSelect(id){
    this.store.data.note.lastUpdatedId = '';
    this.router.navigate(['/note/' + id]);
  }

  DeleteNote(id, event){
    event.stopPropagation();
    const r = confirm("Данная заметка будет удалёна! Вы уверены? (тут конечно будет позже что-то по-красивее :))) )");
    if (r === true) {
      this.action.DeleteNote(id);
    }
  }

   // Обновить роут при фильтрации и запросах
   async refresh_url_search(){
    const promise = new Promise((resolve, reject) => {
      const returnObj = {};
      if (this.store.data.notes.searchText !== '') {returnObj['search'] = this.store.data.notes.searchText; }
      if (this.store.data.notes.searchTags.size > 0){
        let result = '';
        this.store.data.notes.searchTags.forEach((value) => {
          result +=  '-' + value;
        });
        returnObj['tags'] = result;
      }
      this.router.navigate(['/notes'], { queryParams: returnObj });
      resolve();
    });
    return await promise;
  }

  is_Tag_selected(id){
    if (this.store.data.notes.searchTags.has(id)){
      return 'green';
    } else {return 'gold'; }
  }
}
