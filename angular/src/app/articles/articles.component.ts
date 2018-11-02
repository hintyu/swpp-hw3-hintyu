import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { ArticleService } from "../article.service";
import { UserService } from "../user.service";

import { Article } from "../article";


@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  public articles: Article[]

  constructor(
    private articleService: ArticleService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Send back not signed in users
    if (!this.userService.getCurrentUser().signed_in)
      this.gotoSignIn()

    this.getArticleList()
  }

  getArticleList(): void {
    this.articleService.getArticleList()
      .then(articles => this.articles = articles)
  }

  signOut(): void {
    this.userService.signOut()
    this.gotoSignIn()
  }

  findAuthor(author_id: number): string {
    return this.userService.findAuthor(author_id)
  }

  createArticle(): void {
    this.router.navigate(['/create'])
  }

  gotoSignIn(): void{
    this.router.navigate(['../sign_in', {relativeTo: this.route}])
  }
}
