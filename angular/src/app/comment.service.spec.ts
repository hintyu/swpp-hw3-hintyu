import { TestBed, inject } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import { CommentService } from './comment.service';
import { Comment } from './comment';


// just same as article service.
describe('CommentService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let commentService: CommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    })
    spyOn(console, 'error')
    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient)
    httpTestingController = TestBed.get(HttpTestingController)
    commentService = TestBed.get(CommentService)
  })

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify()
  })

  it('should be created', inject([CommentService], (service: CommentService) => {
    expect(service).toBeTruthy()
  }))

  describe('#getCommentList by ID', () => {
    let entireComments: Comment[]
    let expectedComments: Comment[]
    let commentUrl: string

    beforeEach(() => {
      entireComments = [
        {id: 1, article_id: 1, author_id: 1, content: 'a'},
        {id: 2, article_id: 1, author_id: 2, content: 'b'},
        {id: 2, article_id: 2, author_id: 2, content: 'c'}
      ]
      expectedComments = entireComments
        .filter(comment => comment.article_id === 1)

      commentUrl = '/api/comments'
    })

    it('should return expected comments by Id', () => {
      commentService.getCommentList().then(
        comments => expect(comments)
          .toEqual(expectedComments, 'should return expected comments'),
        fail
      )
      const req = httpTestingController.expectOne(commentUrl)
      expect(req.request.method).toEqual('GET')
      req.flush(expectedComments) // TODO: fix
    })
  })

  // it getCommentList should send GET request to httpClient
  //    and should return promise of expectedCommentList
  // it getCommentList should return empty array when 404
  //    and call console.error and reject the promise
  describe('#getCommentList', () => {
    let expectedComments: Comment[]
    let commentUrl: string
    beforeEach(() => {
      expectedComments = [
        {id: 1, article_id: 1, author_id: 1, content: 'a'},
        {id: 2, article_id: 1, author_id: 2, content: 'b'},
      ] as Comment[];
      commentUrl = '/api/comments'
    })

    it('should return expected comments (called once)', () => {
      commentService.getCommentList().then(
        comments => expect(comments)
          .toEqual(expectedComments, 'should return expected comments'),
        fail
      )
      const req = httpTestingController.expectOne(commentUrl)
      expect(req.request.method).toEqual('GET')
      req.flush(expectedComments)
    })

    it('should be OK returning no comments', () => {
      commentService.getCommentList().then(
        comments => expect(comments.length).toEqual
        (0, 'should have empty array'),
        fail
      )
      const req = httpTestingController.expectOne(commentUrl)
      req.flush([])
    })

    it('should return empty array with 404 error', () => {
      const msg = 'Deliberate 404'
      commentService.getCommentList().then(comments => {
          expect(comments).toEqual([])
          expect(console.error).toHaveBeenCalled()
        }
      )
      const req = httpTestingController.expectOne(commentUrl);
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    })

    it('should return expected comments (called multiple times)', () => {
      commentService.getCommentList()
      commentService.getCommentList()
      commentService.getCommentList().then(
        comments => expect(comments).toEqual
        (expectedComments, 'should return expected comments'),
        fail
      );

      const requests = httpTestingController.match(commentUrl);
      expect(requests.length).toEqual(3, 'calls to getCommentList()')

      requests[0].flush([]);
      requests[1].flush([{id: 1, article_id: 1, author_id: 1, content: 'a'}])
      requests[2].flush(expectedComments);
    });
  });

  // it getComment should send GET request to httpClient
  //     and should return promise of expectedComment
  // it getCommentList should console.error and reject the promise when 404
  // it addComment should send POST request to httpClient
  //    and should return promise of posted comment
  describe('#getComment', () => {
    let commentUrl: string
    let expectedComment: Comment

    beforeEach(() => {
      commentService = TestBed.get(CommentService)
      commentUrl = '/api/comments/'
      expectedComment = {id: 1, article_id: 1, author_id: 1, content: 'a'}
    })


    it('should return expected comment (called once)', () => {
      commentService.getComment(expectedComment.id).then(
        comment => expect(comment).toEqual(
          expectedComment, 'should return expected comment'),
        fail
      )

      let commentIdUrl = commentUrl + expectedComment.id
      const req = httpTestingController.expectOne(commentIdUrl)
      expect(req.request.method).toEqual('GET')
      req.flush(expectedComment);
    })

    it('should resolve undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      commentService.getComment(expectedComment.id).then(comment => {
          expect(comment).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      )
      let commentIdUrl = commentUrl + expectedComment.id
      const req = httpTestingController.expectOne(commentIdUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

  describe('#updateComment', () => {
    let expectedComments: Comment[]
    let commentUrl: string
    let updatedComment: Comment

    beforeEach(() => {
      commentService = TestBed.get(CommentService);
      expectedComments = [
        {id: 1, article_id: 1, author_id: 1, content: 'a'},
        {id: 2, article_id: 1, author_id: 2, content: 'b'},
      ] as Comment[]
      commentUrl = '/api/comments'
      updatedComment = {id: 1, article_id: 1, author_id: 1, content: 'aaa'}
    })

    it('should send PUT request', () => {
      commentService.updateComment(updatedComment).then(
        comment => expect(comment).toEqual(
          updatedComment, 'should return updated comment'),
        fail
      )
      let updateUrl = commentUrl + '/' + updatedComment.id
      const req = httpTestingController.expectOne(updateUrl)
      expect(req.request.method).toEqual('PUT')
      req.flush(updatedComment)
    })

    it('should resolve undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      commentService.updateComment(updatedComment).then(error => {
        expect(console.error).toHaveBeenCalled()
        expect(error).toBeUndefined()
      })
      let updateUrl = commentUrl + '/' + updatedComment.id
      const req = httpTestingController.expectOne(updateUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })

// it addComment should console.error and reject the promise when client error : WHAT KIND?
  describe('#addComment', () => {
    let commentUrl: string
    let addedComment: Comment

    beforeEach(() => {
      commentUrl = '/api/comments'
      addedComment = {id: 3, article_id: 1, author_id: 1, content: 'cc'}
    })

    it('should send POST request', () => {
      commentService.addComment(addedComment).then(
        comment => expect(comment).toEqual(
          addedComment, 'should return added comment'),
        fail
      )
      const req = httpTestingController.expectOne(commentUrl);
      expect(req.request.method).toEqual('POST');
      req.flush(addedComment);
    });

    it('should reject with some error', () => {
      const msg = 'Deliberate collision'
      addedComment = {id: 3, article_id: 1, author_id: 1, content: 'c'}
      commentService.updateComment(addedComment).then(fail => null,
        error => {
          expect(error).toBeUndefined()
          expect(console.error).toHaveBeenCalled()
        }
      );
      let addUrl = commentUrl + '/' + addedComment.id
      const req = httpTestingController.expectOne(addUrl);
      // respond with a 403 and the error message in the body
      req.flush(msg, {status: 403, statusText: 'Forbidden'})
    });
  })

  describe('#deleteComment', () => {
    let expectedComments: Comment[]
    let deletedComment: Comment
    const deletedCommentId = 1
    let commentUrl: string

    beforeEach(() => {
      commentService = TestBed.get(CommentService);
      expectedComments = [
        {id: 1, article_id: 1, author_id: 1, content: 'a'},
        {id: 2, article_id: 1, author_id: 2, content: 'b'},
      ] as Comment[]
      commentUrl = '/api/comments'
      deletedComment = expectedComments[0]
    })

    it('should send DELETE request with ID', () => {
      commentService.deleteComment(deletedCommentId).then(
        deleted => {
          expect(deleted).toEqual(deletedComment)
        }
      )
      let deleteUrl = commentUrl + '/' + deletedCommentId

      const req = httpTestingController.expectOne(deleteUrl)
      expect(req.request.method).toEqual('DELETE')
      req.flush(deletedComment)
    })

    it('should send DELETE request with Comment', () => {
      commentService.deleteComment(deletedComment).then(
        deleted => {
          expect(deleted).toEqual(deletedComment)
        }
      )
      let deleteUrl = commentUrl + '/' + deletedComment.id
      const req = httpTestingController.expectOne(deleteUrl)
      expect(req.request.method).toEqual('DELETE')
      req.flush(deletedComment)
    })

    it('should reject undefined with 404 error', () => {
      const msg = 'Deliberate 404'
      commentService.deleteComment(deletedComment).then(comment => {
        },
        error => {
          expect(console.error).toHaveBeenCalled()
          expect(error).toBeUndefined() // TODO: how to check promise reject?
        }
      )
      let deleteUrl = commentUrl + '/' + deletedComment.id
      const req = httpTestingController.expectOne(deleteUrl)
      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'})
    });
  })
})