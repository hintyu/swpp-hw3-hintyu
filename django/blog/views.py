from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed
from django.http import HttpResponseBadRequest, HttpResponseNotFound
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from blog.models import Article, Comment
import json
from json.decoder import JSONDecodeError

@ensure_csrf_cookie
def signup(request):
    # POST api/signup Create a user with the information given by request JSON body
    # and response with 201
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        try:
            User.objects.create_user(username=username, password=password)
        except:
            return HttpResponse('Duplicate User', status=403)
        return HttpResponse('Signed up', status=201)
    else:
        return HttpResponseNotAllowed(['POST']) # 405

@ensure_csrf_cookie
def signin(request):
    # POST api/signin Authenticate with the information given by request JSON body.
    # If success, log-in (the authentication info should be changed properly) and
    # response with 204. If fail, response with 401.
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        req_username = req_data['username']
        req_password = req_data['password']
        user = authenticate(username=req_username, password=req_password)
        if user is not None:
            login(request, user)
            return HttpResponse('Signed in', status=204)
        else:
            return HttpResponse('Unauthenticated', status=401)
    else:
        return HttpResponseNotAllowed(['POST'])

# GET api/signout If the user is authenticated, log-out(the authentication info should be changed)
# and response with 204. If not, response with 401.
def signout(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            logout(request)
            return HttpResponse('Signed out', status=204)
        else:
            return HttpResponseNotAllowed(['GET']) # 405
    else:
        return HttpResponse('Unauthenticated', status=401)


@ensure_csrf_cookie
def article(request):
    if request.user.is_authenticated:
        # GET api/article Response with a JSON having a list of dictionaries for each article's
        # title, content, and author. The value of the author must be the id of the author.
        if request.method == 'GET':
            def toDict(article):
                return {
                    'title': article['title'],
                    'content': article['content'],
                    'author': article['author_id']
                }
            article_list_obj = Article.objects.all().values()
            article_list = [toDict(article) for article in article_list_obj]
            return JsonResponse(article_list, safe=False)
        # POST api/article Create an article with the information given by request JSON body
        # and response with 201
        elif request.method == 'POST':
            try:
                body = request.body.decode()
                title = json.loads(body)['title']
                content = json.loads(body)['content']
            except (KeyError, JSONDecodeError) as e:
                return HttpResponseBadRequest() # 400
            new_article = Article(
                title=title,
                content=content,
                author=request.user
            )
            new_article.save()
            return HttpResponse('Posted', status=201)
        else:
            return HttpResponseNotAllowed(['GET', 'POST']) # 405
    else:
        return HttpResponse('Unautenticated', status=401)

@ensure_csrf_cookie
def article_detail(request, article_id):
    if request.user.is_authenticated:
        # GET api/article/:article_id Response with a JSON having a dictionary for the target
        # article's title, content, and author. The value of the author must be the id of the author.
        if request.method == 'GET':
            try:
                article = Article.objects.get(id=article_id)
            except Article.DoesNotExist:
                return HttpResponseNotFound() # 404
            response_dict = {
                'title': article.title,
                'content': article.content,
                'author': article.author.id
            }
            return JsonResponse(response_dict)
        # PUT api/article/:article_id Update the target article with the information
        # given by request JSON body and response with 200
        elif request.method == 'PUT':
            try:
                article = Article.objects.get(id=article_id)
            except Article.DoesNotExist:
                return HttpResponseNotFound() # 404
            # For all PUT and DELETE requests from non-author, response with 403
            if request.user.id == article.author.id:
                body = request.body.decode()
                article.title = json.loads(body)['title']
                article.content = json.loads(body)['content']
                article.save()
                return HttpResponse('Updated', status=200)
            else:
                return HttpResponse('Forbidden', status=403)
        # DELETE api/article/:article_id Delete the target article and response with 200.
        # When deleting an article, all comments under the target article must be deleted also.
        elif request.method == 'DELETE':
            try:
                article = Article.objects.get(id=article_id)
            except Article.DoesNotExist:
                return HttpResponseNotFound() # 404
            # For all PUT and DELETE requests from non-author, response with 403
            if request.user.id == article.author.id:
                article.delete()
                return HttpResponse('Deleted', status=200)
            else:
                return HttpResponse('Forbidden', status=403)
        else:
            return HttpResponseNotAllowed(['GET',' PUT', 'DELETE']) # 405
    else:
        return HttpResponse('Unauthenticated', status=401)


@ensure_csrf_cookie
def article_comment(request, article_id):
    if request.user.is_authenticated:
        # GET api/article/:article_id/comment Response with a JSON having a list of dictionaries
        # for each comment's article, content, and author.
        # The value of the article and the author must be the id of the article and the author
        # but not the title and her username.
        if request.method == 'GET':
            try:
                commentedArticle = Article.objects.get(id = article_id)
            except:
                return HttpResponseNotFound()  # 404
            def toDict(comment):
                return {
                    'article': comment['article_id'],
                    'content': comment['content'],
                    'author': comment['author_id']
                }
            comment_list_obj = Comment.objects.filter(article_id = article_id).values()
            comment_list = [toDict(comment) for comment in comment_list_obj]
            return JsonResponse(comment_list, safe=False)
        # POST api/article/:article_id/comment Create a comment with the information
        # given by request JSON body and response with 201.
        elif request.method == 'POST':
            try:
                commented_article = Article.objects.get(id=article_id)
            except:
                return HttpResponseNotFound() # 404
            body = request.body.decode()
            content = json.loads(body)['content']
            comment = Comment(
                content = content,
                article = commented_article,
                author = request.user)
            comment.save()
            return HttpResponse('Posted', status=201)
        else:
            return HttpResponseNotAllowed(['GET', 'POST']) # 405
    else:
        return HttpResponse('Unauthenticated', status=401)

@ensure_csrf_cookie
def comment_detail(request, comment_id):
    if request.user.is_authenticated:
        # GET api/comment/:comment_id Response with a JSON having a dictionary
        # for the target comment's article, content, and author.
        # The value of the article and the author must be the id of the article and the author.
        if request.method == 'GET':
            try:
                comment = Comment.objects.get(id=comment_id)
            except:
                return HttpResponseNotFound() # 404
            response_dict = {
                'article': comment.article.id,
                'content': comment.content,
                'author': comment.author.id
            }
            return JsonResponse(response_dict)
        # PUT api/comment/:comment_id Update the target comment with the information
        # given by request JSON body and response with 200
        elif request.method == 'PUT':
            try:
                comment = Comment.objects.get(id=comment_id)
            except:
                return HttpResponseNotFound() # 404
            if request.user.id == comment.author.id:
                body = request.body.decode()
                comment.content = json.loads(body)['content']
                comment.save()
                return HttpResponse('Updated', status=200)
            else:
                return HttpResponse('Forbidden', status=403)
        # DELETE api/comment/:comment_id Delete the target comment and response with 200.
        # When deleting a comment, other users, articles and comments must not be deleted also.
        elif request.method == 'DELETE':
            try:
                comment = Comment.objects.get(id=comment_id)
            except:
                return HttpResponseNotFound() # 404
            if request.user.id == comment.author.id:
                comment.delete()
                return HttpResponse('Deleted', status=200)
            else:
                return HttpResponse('Forbidden', status=403)
        else:
            return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE']) # 405
    else:
        return HttpResponse('Unauthenticated', status=401)

@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])
