import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from "@angular/router";
import { Location } from "@angular/common";

import { User } from "../user";
import { Article } from "../article";
import { UserService } from "../user.service";
import { ArticleService } from "../article.service";

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css']
})
export class ArticleEditComponent implements OnInit {

  article: Article = new Article()
  originalTitle: string
  originalContent: string
  currentUser: User

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private userService: UserService,
    private location: Location,
    private router: Router
  ) { }


  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()
    if(!this.currentUser.signed_in)
      this.gotoSignIn()

    this.getArticle()
    this.saveOriginalArticle()
    this.currentUser = this.userService.getCurrentUser()
  }


  getArticle(): void {
    const id = +this.route.snapshot.paramMap.get('id')
    this.articleService.getArticle(id)
      .then(article => this.article = article)
      .then(() => this.saveOriginalArticle())
  }

  saveOriginalArticle(): void {
    this.originalTitle = this.article.title
    this.originalContent = this.article.content
  }

  signOut(): void {
    this.userService.signOut()
    this.gotoSignIn()
  }

  goBackTry():void {
    if (this.originalTitle === this.article.title
      && this.originalContent === this.article.content) {
      this.location.back()
      return
    }
    else {
      if(confirm('Are you sure? The change will be lost.')) {
        this.location.back()

      } else return // Stay on the edit page
    }
  }

  gotoSignIn():void {
    this.router.navigate(['../../../sign_in', {relativeTo: this.route}])
  }

  confirmEdit():void {
    this.articleService.updateArticle(this.article)
      .then(()=> this.location.back())
  }

}
