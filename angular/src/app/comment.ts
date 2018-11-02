export class Comment {
  id: number
  article_id: number
  author_id: number
  content: string

  constructor(article_id: number = -9999){
    this.article_id = article_id
  }
}