from django.shortcuts import render
from .models import Album , MusicSet

def HomePage(request):
    all_albums = Album.objects.filter(available__exact = True)
    count_album = all_albums.count()

    context = {
        'all_albums' : all_albums ,
        'count_album' : count_album,
    }

    return render(request, 'main/content.html' , context)