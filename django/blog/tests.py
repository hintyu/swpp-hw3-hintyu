from django.test import TestCase, Client, RequestFactory
from django.contrib import auth
from blog.models import Article, Comment
from django.contrib.auth.models import User
import json


class BlogTestCase(TestCase):

    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        # User setup
        test_user = User.objects.create_user(username='user1', password='pass1')
        test_user2 = User.objects.create_user(username='user2', password='pass2')
        test_user.save()
        test_user2.save()
        # Article Setup
        test_article = Article(title='article1', content='content1', author=test_user)
        test_article2 = Article(title='article2', content='content2', author=test_user2)
        test_article.save()
        test_article2.save()
        # Comment Setup
        test_comment = Comment(article=test_article, content='comment', author=test_user)
        test_comment2 = Comment(article=test_article2, content='comment', author=test_user2)
        test_comment.save()
        test_comment2.save()

    def test_csrf(self):
        # By default, csrf checks are disabled in test client
        # To test csrf protection we enforce csrf checks here
        self.client = Client(enforce_csrf_checks=True)
        response = self.client.post('/api/signup',
                                    json.dumps({'username': 'chris', 'password': 'chris'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 403)  # Request without csrf token returns 403 response

        response = self.client.get('/api/token')
        csrftoken = response.cookies['csrftoken'].value  # Get csrf token from cookie

        response = self.client.post('/api/signup',
                                    json.dumps({'username': 'chris', 'password': 'chris'}),
                                    content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken)
        self.assertEqual(response.status_code, 201)  # Pass csrf protection



    def test_signup(self):
        response = self.client.post('/api/token')
        self.assertEqual(response.status_code, 405) # Not allowed method

        # if success, return 201, user created.
        response = self.client.post('/api/signup',
                                    json.dumps({'username': 'name', 'password': 'pass'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        saved_user = User.objects.get(username='name')
        self.assertEqual(saved_user.username, 'name')
        # TODO: self.assertEqual(saved_user.password, 'pass')
        # if duplicate name, return 403 'Forbidden'
        response = self.client.post('/api/signup',
                                    json.dumps({'username': 'user1', 'password': 'pass1'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 403)
        # For all non-allowed requests (X marked in the API table), response with 405.
        response = self.client.delete('/api/signup')
        self.assertEqual(response.status_code, 405)

    def test_signin(self):
        # it should 401 if authentication fails (user None)
        response = self.client.post('/api/signin',
                                    json.dumps({'username': 'user1', 'password': 'fail'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 401)
        signin_user = User.objects.get(username='user1')
        auth_user = auth.get_user(self.client)
        self.assertNotEqual(signin_user.username, auth_user.username)
        assert not auth_user.is_authenticated

        # it should 204 with correct user name (user not None)
        response = self.client.post('/api/signin',
                                    json.dumps({'username': 'user1', 'password': 'pass1'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 204)
        # session with user should be true (is_authenticated)
        auth_user = auth.get_user(self.client)
        self.assertEqual(signin_user.username, auth_user.username)
        assert auth_user.is_authenticated

        # it should 405 for non-allowed requests
        response = self.client.delete('/api/signin')
        self.assertEqual(response.status_code, 405)

    def test_signout(self):
        # sign in first
        self.client.post('/api/signin',
                        json.dumps({'username': 'user1', 'password': 'pass1'}),
                        content_type='application/json')
        # it should 405 for non-allowed requests
        response = self.client.delete('/api/signout')
        self.assertEqual(response.status_code, 405)
        # it should 204 if signed in
        auth_user = auth.get_user(self.client)
        assert auth_user.is_authenticated
        response = self.client.get('/api/signout', content_type='application/json')
        self.assertEqual(response.status_code, 204)
        # and user should be unauthenticated
        auth_user = auth.get_user(self.client)
        assert not auth_user.is_authenticated
        # it should 401 if not signed in
        response = self.client.get('/api/signout')
        self.assertEqual(response.status_code, 401)

    def test_article(self):
        # For all requests about article and comment without signing in, response with 401
        response = self.client.get('/api/article', content_type='application/json')
        self.assertEqual(response.status_code, 401)
        # sign in
        self.client.post('/api/signin',
                        json.dumps({'username': 'user1', 'password': 'pass1'}),
                        content_type='application/json')
        # GET api/article Response with a JSON having a list of dictionaries for each article's
        # title, content, and author. The value of the author must be the id of the author.
        response = self.client.get('/api/article', content_type='application/json')
        article_size = len(Article.objects.all())
        self.assertEqual(len(response.json()), article_size)
        test_user = User.objects.get(username='user1')
        self.assertEqual(response.json()[0]['author'], test_user.id)
        # POST api/article Create an article with the information given by request JSON body
        # and response with 201
        response = self.client.post('/api/article',
                                    json.dumps({'title': 'article3', 'content': 'content3'}),
                                    content_type='application/json')
        # doesn't call exception because 'article3' saved
        self.assertTrue(Article.objects.get(title='article3'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(Article.objects.all()), article_size+1)
        # Response 400 for bad request
        response = self.client.post('/api/article',
                                    json.dumps({'title': ''}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)
        # Not Allowed Method
        response = self.client.delete('/api/article')
        self.assertEqual(response.status_code, 405)

    def test_article_detail(self):
        # For all requests about article and comment without signing in, response with 401
        response = self.client.get('/api/article/1', content_type='application/json')
        self.assertEqual(response.status_code, 401)
        # sign in
        self.client.post('/api/signin',
                         json.dumps({'username': 'user1', 'password': 'pass1'}),
                         content_type='application/json')
        # GET api/article/:article_id Response with a JSON having a dictionary for the target
        # article's title, content, and author. The value of the author must be the id of the author.
        # GET failed
        response = self.client.get('/api/article/999', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # GET success
        response = self.client.get('/api/article/1', content_type='application/json')
        test_user = User.objects.get(username='user1')
        self.assertEqual(response.json()['author'], test_user.id)

        # PUT api/article/:article_id Update the target article with the information
        # given by request JSON body and response with 200
        # PUT failed
        response = self.client.put('/api/article/999',
                                   json.dumps({'title': 'article_update', 'content': 'content_update'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # PUT not authorized
        response = self.client.put('/api/article/2',
                                   json.dumps({'title': 'article_update', 'content': 'content_update'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 403)
        # PUT success
        response = self.client.put('/api/article/1',
                                   json.dumps({'title': 'article_update', 'content': 'content_update'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        updated_article = Article.objects.get(id=1)
        self.assertEqual(updated_article.title, 'article_update')

        # DELETE api/article/:article_id Delete the target article and response with 200.
        # When deleting an article, all comments under the target article must be deleted also.
        # failed to find
        article_count_original = len(Article.objects.all())
        response = self.client.delete('/api/article/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(len(Article.objects.all()), article_count_original)
        # not authorized delete
        response = self.client.delete('/api/article/2')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(len(Article.objects.all()), article_count_original)
        # success to delete
        response = self.client.delete('/api/article/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Article.objects.all()), article_count_original-1)
        response = self.client.get('/api/article/1', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # Not allowed method
        response = self.client.post('/api/article/3',
                                    json.dumps({'title': 'article_update', 'content': 'content_update'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 405)

    def test_comment(self):
        # For all requests about article and comment without signing in, response with 401
        response = self.client.get('/api/article/1/comment', content_type='application/json')
        self.assertEqual(response.status_code, 401)
        # sign in
        self.client.post('/api/signin',
                         json.dumps({'username': 'user1', 'password': 'pass1'}),
                         content_type='application/json')
        # GET api/article/:article_id/comment Response with a JSON having a list of dictionaries
        # for each comment's article, content, and author.
        # GET fail
        response = self.client.get('/api/article/999/comment', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # GET success
        response = self.client.get('/api/article/1/comment', content_type='application/json')
        self.assertEqual(response.json()[0]['article'], 1)
        comment_size_original = len(response.json())
        # POST api/article/:article_id/comment Create a comment with the information
        # given by request JSON body and response with 201.
        # POST fail
        response = self.client.post('/api/article/999/comment',
                                    json.dumps({'content': 'posted_comment'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # POST success
        response = self.client.post('/api/article/1/comment',
                                    json.dumps({'content': 'posted_comment'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        response = self.client.get('/api/article/1/comment', content_type='application/json')
        self.assertEqual(len(response.json()), comment_size_original+1)
        test_user = User.objects.get(username='user1')
        self.assertEqual(response.json()[1]['author'], test_user.id)
        # Not allowed method
        response = self.client.delete('/api/article/1/comment')
        self.assertEqual(response.status_code, 405)

    def test_comment_detail(self):
        # For all requests about article and comment without signing in, response with 401
        response = self.client.get('/api/comment/1', content_type='application/json')
        self.assertEqual(response.status_code, 401)
        # sign in
        self.client.post('/api/signin',
                         json.dumps({'username': 'user1', 'password': 'pass1'}),
                         content_type='application/json')
        # GET api/comment/:comment_id Response with a JSON having a dictionary
        # for the target comment's article, content, and author.
        # GET failed
        response = self.client.get('/api/comment/999', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # GET success
        response = self.client.get('/api/comment/1', content_type='application/json')
        test_user = User.objects.get(id=1)
        self.assertEqual(response.json()['article'], 1)
        self.assertEqual(response.json()['author'], test_user.id)

        # PUT api/comment/:comment_id Update the target comment with the information
        # given by request JSON body and response with 200
        # PUT failed
        response = self.client.put('/api/comment/999',
                                   json.dumps({'content': 'updated_content'}),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # PUT unauthorized
        response = self.client.put('/api/comment/2',
                                   json.dumps({'content': 'updated_content'}),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 403)
        # PUT success
        response = self.client.put('/api/comment/1',
                                   json.dumps({'content': 'updated_content'}),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        updated_comment = Comment.objects.get(id=1)
        self.assertEqual(updated_comment.content, 'updated_content')

        # DELETE api/comment/:comment_id Delete the target comment and response with 200.
        # When deleting a comment, other users, articles and comments must not be deleted also.
        # DELETE failed
        response = self.client.delete('/api/comment/999', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # DELETE unauthorized
        response = self.client.delete('/api/comment/2', content_type='application/json')
        self.assertEqual(response.status_code, 403)
        comment_count_original = len(Comment.objects.all())
        # DELETE success
        response = self.client.delete('/api/comment/1', content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(Comment.objects.all()), comment_count_original-1)
        response = self.client.get('/api/comment/1', content_type='application/json')
        self.assertEqual(response.status_code, 404)
        # not allowed method
        response = self.client.post('/api/comment/1')
        self.assertEqual(response.status_code, 405)



