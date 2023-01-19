from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Urls
    path("api/posts", views.posts, name="posts"),
    path("api/posts/create", views.create_post, name="create_post"),
    path("api/posts/<int:post_id>", views.post, name="post")
]
