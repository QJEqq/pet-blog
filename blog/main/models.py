from django.db import models
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
import os
from mutagen import File
from datetime import timedelta

class Album(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    image = models.ImageField(upload_to='album_photo/')
    available = models.BooleanField(default=True)
        
    
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
    image = models.ImageField(upload_to='MusicSet_photo/')
    album = models.ForeignKey(Album, 
                            on_delete=models.CASCADE,
                            verbose_name='albums')
    duration = models.DurationField(blank=True, null=True)  
    audio_file = models.FileField(
        upload_to='songs/%Y/%m/%d/',  
        help_text='Загрузить аудио файл'
    )
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
                
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new and self.audio_file and not self.duration:
            self.calculate_duration(*args, **kwargs)

    def calculate_duration(self, *args, **kwargs):
        try:
            file_path = self.audio_file.path
            if os.path.exists(file_path):
                audio = File(file_path)
                if audio is not None:
                    duration_seconds = int(audio.info.length)

                    self.duration = timedelta(seconds=duration_seconds)

                    super().save(*args, **kwargs, update_fields=['duration'])
    
                    
        except Exception as e:
            print(f"Ошибка при вычислении длительности: {e}")

    def get_duration_display(self):
        """Возвращает отформатированную длительность в формате MM:SS"""
        if not self.duration:
            return "--:--"
        
        total_seconds = int(self.duration.total_seconds())
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"