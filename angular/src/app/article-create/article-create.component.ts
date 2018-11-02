import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";


import { Article } from "../article";
import { ArticleService } from "../article.service";
import { User } from "../user";
import { UserService } from "../user.service";


@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit {

  public article: Article
  public currentUser: User

  constructor(
    private articleService: ArticleService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.article = new Article()
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()
      if(!this.currentUser.signed_in)
        this.gotoSignIn()

    this.article = new Article()
    let id = this.route.snapshot.paramMap.get('id')
  }

  signOut(): void {
    this.userService.signOut()
    this.gotoSignIn()
  }

  goBack():void {
      this.router.navigate(['../', {relativeTo: this.route}])
  }

  gotoSignIn(): void{
    this.router.navigate(['../../sign_in', {relativeTo: this.route}])
  }


  confirmArticle():void {
    this.article.author_id = this.currentUser.id
    this.articleService.addArticle(this.article)
      .then(newArticle =>
        this.router.navigate(['../', {relativeTo: this.route}, newArticle.id]))
  }

  findAuthor(author_id: number){
    return this.userService.findAuthor(author_id)
  }
}
