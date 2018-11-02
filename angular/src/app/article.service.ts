import { Injectable } from '@angular/core';

import { Article } from './article';
import { HttpClient, HttpHeaders } from '@angular/common/http';


// httpHeaders란 무엇인가??
const httpOptions = {
  headers: new HttpHeaders( { 'Content-Type': 'application/json'} )
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private articleUrl = '/api/articles'

  constructor(
    private http: HttpClient
  ) { }


  /** GET functions **/
  getArticleList(): Promise<Article[]> {
    return this.http.get<Article[]>(this.articleUrl)
      .toPromise()
      .catch(this.handleError('getArticleList', []))
  }

  getArticle(id: number): Promise<Article> {
    const url = `${this.articleUrl}/${id}`
    return this.http.get<Article>(url)
      .toPromise()
      .catch(this.handleError('getArticle id=${id}'))
  }

  /** PUT functions **/
  updateArticle(article: Article): Promise<Article> {
    const url = `${this.articleUrl}/${article.id}`
    return this.http.put(url, article, httpOptions)
      .toPromise()
      .then(() => article)
      .catch(this.handleError<Article>('updateArticle'))
  }

  /** POST functions **/
  addArticle(article: Partial<Article>): Promise<Article> {
    return this.http.post<Article>(this.articleUrl, article, httpOptions)
      .toPromise()
      .catch(this.handleError<Article>('addArticle'))
  }

  /** DELETE functions **/
  deleteArticle(article: Article | number): Promise<Article> {
    const id = (typeof article === 'number') ? article : article.id
    const url = `${this.articleUrl}/${id}`
    return this.http.delete<Article>(url, httpOptions)
      .toPromise()
      .catch(this.handleError<Article>('deleteArticle)'))
  }

  /** Handle Http operation that failed **/
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Promise<T> => {
      console.error(error);
      return Promise.reject(result as T);
    };
  }

}
