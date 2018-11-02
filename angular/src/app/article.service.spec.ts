import {TestBed, inject, fakeAsync, tick} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { ArticleService } from './article.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {Article} from './article';


describe('ArticleService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let articleService: ArticleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ ArticleService ]
    })
    spyOn(console, 'error')
    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient)
    httpTestingController = TestBed.get(HttpTestingController)
    articleService = TestBed.get(ArticleService)
  })

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify()
  })

  it('should be created', inject([ArticleService], (service: ArticleService) => {
    expect(service).toBeTruthy()
  }))

  // it getArticleList should send GET request to httpClient
  //    and should return promise of expectedArticleList
  // it getArticleList should return empty array when 404
  //    and call console.error and reject the promise
  describe('#getArticleList', () => {
    let expectedArticles: Article[]
    let articleUrl: string
    beforeEach(() => {
      expectedArticles = [
        { id: 1, author_id: 10, title: 'a', content: 'b' },
        { id: 2, author_id: 20, title: 'c', content: 'd' },
      ] as Article[];
      articleUrl = '/api/articles'
    })

    it('should return expected articles (called once)', () => {
      articleService.getArticleList().then(
        articles => expect(articles)
          .toEqual(expectedArticles, 'should return expected articles'),
        fail
      )
      const req = httpTestingController.expectOne(articleUrl)
      expect(req.request.method).toEqual('GET')
      req.flush(expectedArticles)
    })

    it('should be OK returning no articles', () => {
      articleService.getArticleList().then(
        articles => expect(articles.length).toEqual
        (0, 'should have empty array'),
        fail
      )
      const req = httpTestingController.expectOne(articleUrl)
      req.flush([])
    })

    it('should return empty array with 404 error', () => {
      const msg = 'Deliberate 404'
      articleService.getArticleList().then(articles => {},
        failed => {
          expect(failed).toEqual([])
          expect(console.error).toHaveBeenCalled()
        }
      )
      const req = httpTestingController.expectOne(articleUrl);
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    })

    it('should return expected articles (called multiple times)', () => {
      articleService.getArticleList()
      articleService.getArticleList()
      articleService.getArticleList().then(
        articles => expect(articles).toEqual
        (expectedArticles, 'should return expected articles'),
        fail
      );

      const requests = httpTestingController.match(articleUrl);
      expect(requests.length).toEqual(3, 'calls to getArticleList()')

      requests[0].flush([]);
      requests[1].flush([{ id: 1, author_id: 10, title: 'a', content: 'b' }])
      requests[2].flush(expectedArticles);
    });
  });

  // it getArticle should send GET request to httpClient
  //     and should return promise of expectedArticle
  // it getArticleList should console.error and reject the promise when 404
  // it addArticle should send POST request to httpClient
  //    and should return promise of posted article
  describe('#getArticle', () => {
    let articleUrl: string
    let expectedArticle: Article

    beforeEach(() => {
      articleService = TestBed.get(ArticleService)
      articleUrl = '/api/articles/'
      expectedArticle = {id: 1, author_id: 10, title: 'aa', content: 'bb'}
    })


    it('should return expected article (called once)', () => {
      articleService.getArticle(expectedArticle.id).then(
        article => expect(article).toEqual(
          expectedArticle,'should return expected article'),
        fail
      )

      let articleIdUrl = articleUrl + expectedArticle.id
      const req = httpTestingController.expectOne(articleIdUrl)
      expect(req.request.method).toEqual('GET')
      req.flush(expectedArticle);
    })

    it('should resolve undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      articleService.getArticle(expectedArticle.id).then(article => {
          expect(article).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      )
      let articleIdUrl = articleUrl + expectedArticle.id
      const req = httpTestingController.expectOne(articleIdUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

  describe('#updateArticle', () => {
    let expectedArticles: Article[]
    let articleUrl: string
    let updatedArticle: Article

    beforeEach(() => {
      articleService = TestBed.get(ArticleService);
      expectedArticles = [
        { id: 1, author_id: 10, title: 'a', content: 'b' },
        { id: 2, author_id: 20, title: 'c', content: 'd' },
      ] as Article[]
      articleUrl = '/api/articles'
      updatedArticle = {id: 1, author_id: 10, title: 'aa', content: 'bb'}
    })

    it('should send PUT request', () => {
      articleService.updateArticle(updatedArticle).then(
        article => expect(article).toEqual(
          updatedArticle,'should return updated article'),
        fail
      )
      let updateUrl = articleUrl + '/' + updatedArticle.id
      const req = httpTestingController.expectOne(updateUrl)
      expect(req.request.method).toEqual('PUT')
      req.flush(updatedArticle)
    })

    it('should reject undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      articleService.updateArticle(updatedArticle).then(article => {},
        error =>{
          expect(console.error).toHaveBeenCalled()
          expect(error).toBeUndefined() // TODO: how to check error
        }
      )
      let updateUrl = articleUrl + '/' + updatedArticle.id
      const req = httpTestingController.expectOne(updateUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

// it addArticle should console.error and reject the promise when client error : WHAT KIND?
  describe('#addArticle', () => {
    let expectedArticles: Article[]
    let articleUrl: string
    let addedArticle: Article

    beforeEach(() => {
      articleUrl = '/api/articles'
      addedArticle = {id: 3, author_id: 30, title: 'e', content: 'f'}
    })

    it('should send POST request', () => {
      articleService.addArticle(addedArticle).then(
        article => expect(article).toEqual(
          addedArticle,'should return added article'),
        fail
      )
      const req = httpTestingController.expectOne(articleUrl);
      expect(req.request.method).toEqual('POST');
      req.flush(addedArticle);
    });

    it('should reject with some error', () => {
      const msg = 'Deliberate collision'
      addedArticle = {id:1, author_id: 30, title: 'a', content: 'b'}
      articleService.updateArticle(addedArticle).then(fail => null,
        error => {
          expect(error).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      );
      let addUrl = articleUrl + '/' + addedArticle.id
      const req = httpTestingController.expectOne(addUrl);
      // respond with a 403 and the error message in the body
      req.flush(msg, {status: 403, statusText: 'Forbidden'})
    });
  })

  describe('#deleteArticle', () => {
    let expectedArticles: Article[]
    let deletedArticle : Article
    const deletedArticleId = 1
    let articleUrl: string

    beforeEach(() => {
      articleService = TestBed.get(ArticleService);
      expectedArticles = [
        { id: 1, author_id: 10, title: 'a', content: 'b' },
        { id: 2, author_id: 20, title: 'c', content: 'd' },
      ] as Article[]
      articleUrl = '/api/articles'
      deletedArticle = expectedArticles[0]
    })

    it('should send DELETE request with ID', () => {
      articleService.deleteArticle(deletedArticleId).then(
        deleted=>{expect(deleted).toEqual(deletedArticle)}
      )
      let deleteUrl = articleUrl + '/' + deletedArticleId

      const req = httpTestingController.expectOne(deleteUrl)
      expect(req.request.method).toEqual('DELETE')
      req.flush(deletedArticle)
    })

    it('should send DELETE request with Article', () => {
      articleService.deleteArticle(deletedArticle).then(
        deleted=>{ expect(deleted).toEqual(deletedArticle)}
      )
      let deleteUrl = articleUrl + '/' + deletedArticle.id
      const req = httpTestingController.expectOne(deleteUrl)
      expect(req.request.method).toEqual('DELETE')
      req.flush(deletedArticle)
    })

    it('should reject undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      articleService.deleteArticle(deletedArticle).then(article => {},
        error =>{
          expect(console.error).toHaveBeenCalled()
          expect(error).toBeUndefined() // TODO: how to check promise reject?
        }
      )
      let deleteUrl = articleUrl + '/' + deletedArticle.id
      const req = httpTestingController.expectOne(deleteUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })
});
