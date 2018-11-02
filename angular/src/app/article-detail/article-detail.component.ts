import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router} from "@angular/router";

import { User } from "../user";
import { UserService } from "../user.service";
import { Article } from "../article";
import { ArticleService } from "../article.service";
import { Comment } from "../comment";
import { CommentService } from "../comment.service";

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {

  article: Article
  comments: Comment[]
  currentUser: User
  newComment: Comment

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private articleService: ArticleService,
    private commentService: CommentService,
    private router: Router
  ) {
    this.article = new Article()
  }

  ngOnInit() {
    // Send back not signed in users
    this.currentUser = this.userService.getCurrentUser()
    if(!this.currentUser.signed_in)
      this.gotoSignIn()
    this.newComment = new Comment()
    this.getArticleAndComments()
  }

  /** initial workout functions**/
  signOut(): void {
    this.userService.signOut()
    this.gotoSignIn()
  }

  getArticleAndComments(): void {
    const id = +this.route.snapshot.paramMap.get('id')
    this.articleService.getArticle(id)
      .then(article => this.article = article,
            ()=> this.gotoSignIn())
            // Send back if no article exists
      // update information of this page from given article
      .then(()=> {
        this.updateComments()
        this.newComment.article_id = this.article.id
        this.newComment.author_id = this.currentUser.id
      })
  }

  findAuthor(author_id: number): string {
    return this.userService.findAuthor(author_id)
  }

  gotoSignIn():void {
    this.router.navigate(['../../sign_in', {relativeTo: this.route}])
  }

  goBack(): void {
    this.router.navigate(['../', {relativeTo: this.route}])
  }

  /** Article methods **/
  deleteArticle(): void{
    this.articleService.deleteArticle(this.article.id)
      .then(()=>
      this.router.navigate(['../', {relativeTo: this.route}]))
  }

  /** Comments methods **/
  updateComments(): void{
    this.commentService.getCommentListbyId(this.article.id)
      .then(commentList => this.comments = commentList)
  }

  createComment(): void {
    this.commentService.addComment(this.newComment)
      .then(()=> this.updateComments())
    this.newComment.content = ''
  }

  editComment(comment: Comment): void {
    comment.content = prompt('Edit comment', comment.content)
    this.commentService.updateComment(comment)
  }

  deleteComment(comment: Comment): void {
    this.commentService.deleteComment(comment)
      .then(() => this.updateComments())
  }

}
