import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { flyInOut, visibility, expand } from '../animations/app.animations';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishCopy: Dish;
  dishIds: string[];
  errMess: string;
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  visibility = 'shown';

  formErrors = {
    'comment': '',
    'author': ''
  };

  validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.'
    }
  };

  constructor(
    private fb: FormBuilder,
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject('BaseURL') private baseURL
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.dishService.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          this.visibility = 'hidden';
          return this.dishService.getDish(+params['id']);
        })
      ).subscribe(
        dish => {
          this.dish = dish;
          this.dishCopy = dish;
          this.setPrevNext(dish.id);
          this.visibility = 'shown';
          },
        errmess => this.errMess = <any>errmess
    );
  }

  createForm() {
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ['', [Validators.required]],
      author: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.dishCopy.comments.push(this.comment);
    this.dishService.putDish(this.dishCopy)
      .subscribe(
        dish => {
          this.dish = dish;
          this.dishCopy = dish;
        },
        errmess => {
          this.dish = null;
          this.dishCopy = null;
          this.errMess = <any>errmess;
        }
      );
    this.commentForm.reset({
      rating: 5,
      comment: '',
      author: ''
    });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
