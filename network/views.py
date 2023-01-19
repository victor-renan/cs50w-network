import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.forms.models import model_to_dict

from .models import *


#API Views
def posts(request):
    # Requires method GET
    if request.method == "GET":
        #Get all the posts by date
        try:
            posts = Post.objects.order_by('-date').all()
            return JsonResponse([post.serialize() for post in posts], safe=False)

        except Exception as e:
            print(e)
            return JsonResponse({"message": f"{e}"})
    else:
        return JsonResponse({"Error": "GET method needed!"})


def create_post(request):
    # Requires method POST
    if request.user.is_authenticated:
        if request.method == "POST":
            # Get the request fields
            data = json.loads(request.body)

            # Attempt to create a new post
            try:
                post = Post(user=request.user, content=data.get("content"))
                post.save()

                return JsonResponse({"message": "The post was created successfully!"})

            except Exception as e:
                print(e)
                return JsonResponse({"Error": f"{e}"})
        else:
            return JsonResponse({"error": "POST method required!"})
    else:
        return JsonResponse({"Error": "You must be logged in to create an post!"})


def post(request, post_id):
    # Get an post with the passed id and other arguments
    def get_post(**kwargs):
        # Try to get the post
        try:
            return Post.objects.get(pk=post_id, **kwargs)
        except Post.DoesNotExist:
            return None

    # Return the post content
    if request.method == "GET":
        if get_post():
            return JsonResponse(get_post().serialize())
        else:
            return JsonResponse({"error": "The post does not exist!"})

        # Modify the post
    elif request.method == "PUT":
        if request.user.is_authenticated:
            # Verify if user is able to edit
            post = get_post(user=request.user)

            # Get the request fields
            data = json.loads(request.body)

            # If has an post
            if get_post():
                if post:
                    # Changes the post content
                    post.content = data.get("content")
                    post.save()

                    return JsonResponse({
                        "post": post.serialize(),
                        "message": "Post was modified successfully!"
                    })
                    
                else:
                    return JsonResponse({"error": "You not able to edit this post!"})
            else:
                return JsonResponse({"error": "The post does not exist!"})
        else:
            return JsonResponse({"error": "You can edit only your own posts!"})

    else:
        return JsonResponse({"error": "Requires methods GET or PUT!"})



def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
