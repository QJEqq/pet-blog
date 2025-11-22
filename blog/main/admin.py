from django.contrib import admin
from .models import Album , MusicSet

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['name']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(MusicSet)
class MusicSetAdmin(admin.ModelAdmin):
    list_display = ['name' , 'artist' , 'album' , 'duration' , 'created_at' , 'updated_at']
    list_filter = ('album' , 'created_at' , 'name')
    prepopulated_fields = {'slug': ('name',)}




# Register your models here.
