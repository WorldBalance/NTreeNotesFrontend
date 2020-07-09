import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { ActionService } from '../../../services/action.service';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.css']
})
export class AddNoteComponent implements OnInit {

  constructor(
    public store: StoreService,
    public action: ActionService,
    private router: Router
  ){

  }

  ngOnInit(): void {
    this.store.data.note.title = '';
    this.store.data.note.text = '';
    this.store.data.note.tags = [];
  }

  AddNote(){
    if (this.store.data.note.text === ''){
      alert('Введите сперва текст заметки!'); return;
    }
    this.action.AddNote();
  }

  Cancel(){
    this.store.data.note.lastUpdatedId = '';
    this.router.navigate(['/notes']);
  }

}
