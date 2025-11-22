from django.db import models
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
import os
from mutagen import File

# Create your models here.
class Album(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    image = models.ImageField(upload_to='album-photo/')
        
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)   
    
    def __str__(self):
        return self.name
    
       
class MusicSet(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    artist = models.CharField(max_length=50)
    image = models.ImageField(upload_to='MusicSet-photo/')
    album = models.ForeignKey(Album, 
                            on_delete=models.CASCADE,
                            verbose_name='albums')
    duration = models.DurationField(blank=True , null=True)
    audio_file = models.FileField(
        upload_to='songs/Y%/m%/d%/',
        help_text='Загрузить аудио файл'
    )
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now= True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        is_new = self.pk is None

        if is_new and self.audio_file:
            super().save(*args, **kwargs)
            self.calculate_duration()
        else:
            super().save(*args, **kwargs)
    
    def calculate_duration(self):
        try:
            if self.audio_file and not self.duration:
                file_path = self.audio_file.path
                if os.path.exists(file_path):
                    audio = File(file_path)
                    if audio is not None:
                        duration_seconds = int(audio.info.length)
                        self.duration_seconds = duration_seconds
                        minutes = duration_seconds // 60
                        seconds = duration_seconds % 60
                        self.duration = f"{minutes:02d}:{seconds:02d}"

                        super().save(update_fields=['duration', 'duration_seconds'])
                        
        except Exception as e:
            print(f"Ошибка при вычислении длительности: {e}")