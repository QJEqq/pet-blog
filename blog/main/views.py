from itertools import count
import json
from django.shortcuts import render
from .models import Album , MusicSet
from django.db.models import Count, Sum

def HomePage(request):

    all_albums = Album.objects.filter(available__exact = True)
    count_album = all_albums.count()
    all_musics = MusicSet.objects.select_related('album').all()
    popular_album = Album.objects.filter(available=True).annotate(
        track_count=Count('musicset')
    ).order_by('-track_count').first()
    
    tracks_data = []
    for track in all_musics:
        tracks_data.append({
            'id': track.id,
            'name': track.name,
            'artist': track.artist,
            'duration': track.duration.total_seconds() if track.duration else 0,
            'duration_display': track.get_duration_display(),
            'audio_url': track.audio_file.url,
            'image_url': track.album.image.url if track.album.image else '',
        })

    context = {
        'all_albums' : all_albums ,
        'count_album' : count_album,
        'tracks' : all_musics,
        'tracks_json': json.dumps(tracks_data),
        'popular_album' : popular_album
    }
    

    return render(request, 'main/content.html' , context)