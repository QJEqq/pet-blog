document.addEventListener('DOMContentLoaded', function() {
    const trackItems = document.querySelectorAll('.track-item');
    const trackImage = document.getElementById('currentTrackImage');
    const imageContainer = document.getElementById('trackImageContainer');
    const placeholder = imageContainer.querySelector('div');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const playBtn = document.getElementById('playBtn'); 
    const audio = document.getElementById('audioPlayer');

    let currentTrackIndex = 0; 
    let currentAudioUrl = '';
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 0.7; 
    
    // Элементы timebar
    const timebar = document.getElementById('timebar');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    // Элементы volumebar
    const volumebar = document.getElementById('volumebar');
    const volumeValue = document.getElementById('volumeValue');
    const muteBtn = document.querySelector('.text-neutral-400.text-sm'); 

    // Инициализация громкости
    audio.volume = volumebar.value;
    
    // Обработчик клика по треку
    trackItems.forEach((item , index) => {
        item.addEventListener('click', function() {
            const trackAudio = this.dataset.audioUrl;
            const trackName = this.dataset.trackName;
            const trackImageUrl = this.dataset.trackImage;
            const trackDuration = this.dataset.trackDuration;
            const trackAlbum = this.dataset.trackAlbum;

            playBtn.textContent = '▶';
            currentTrackIndex = index;
            currentAudioUrl = trackAudio;
            
            // Стилизация треков
            trackItems.forEach(track => {
                track.classList.remove('bg-red-900/10', 'border-red-700/30');
                track.querySelector('span.text-sm').classList.remove('text-red-500', 'font-bold');
                track.querySelector('span.text-sm').classList.add('text-neutral-500');
                track.querySelector('.uppercase').classList.remove('text-white', 'font-medium');
                track.querySelector('.uppercase').classList.add('text-neutral-300');
                track.querySelector('span.text-xs').classList.remove('text-red-400');
                track.querySelector('span.text-xs').classList.add('text-neutral-500');
            });
            
            this.classList.add('bg-red-900/10', 'border-red-700/30');
            this.querySelector('span.text-sm').classList.add('text-red-500', 'font-bold');
            this.querySelector('span.text-sm').classList.remove('text-neutral-500');
            this.querySelector('.uppercase').classList.add('text-white', 'font-medium');
            this.querySelector('.uppercase').classList.remove('text-neutral-300');
            this.querySelector('span.text-xs').classList.add('text-red-400');
            this.querySelector('span.text-xs').classList.remove('text-neutral-500');
            
            // Обновление изображения
            if (trackImageUrl) {
                placeholder.classList.add('hidden');
                trackImage.src = trackImageUrl;
                trackImage.alt = `${trackName} cover`;
                trackImage.classList.remove('hidden');
                
                trackImage.style.opacity = '0';
                setTimeout(() => {
                    trackImage.style.transition = 'opacity 0.5s ease';
                    trackImage.style.opacity = '1';
                }, 50);
            }
            
            updatePlayer(trackName, trackDuration, trackAudio, trackAlbum);
            saveCurrentTrack(trackName, trackImageUrl, trackAudio, index);
        });
    });
    
    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
    
    function getCurrentTrackIndex() {
        let activeIndex = 0;
        trackItems.forEach((item, index) => {
            if (item.classList.contains('bg-red-900/10')) {
                activeIndex = index;
            }
        });
        return activeIndex;
    }

    function playTrackByIndex(index) {
        if (index >= 0 && index < trackItems.length) {
            trackItems[index].click();
            
            if (isPlaying) {
                setTimeout(() => {
                    audio.play();
                }, 100);
            }
        }
    }
    
    function updatePlayer(trackName, duration, trackAudio, trackAlbum) {
        console.log(`Now playing: ${trackName} (${duration})`);
        
        const playerPart = document.querySelector('.player-paet-trackname');
        if (playerPart) {
            const albumDisplay = (trackAlbum && trackAlbum !== "undefined") ? trackAlbum : '';

            playerPart.innerHTML = `
                <div class="text-white font-bold text-lg mb-0.5 uppercase tracking-wide">${trackName}</div>
                <div class="text-neutral-500 text-xs uppercase tracking-widest font-extralight">${albumDisplay}</div>
            `;
        }

        if (trackAudio) {
            audio.src = trackAudio;
        }
    }
    
    // ==================== VOLUMEBAR И MUTE ====================
    
    function updateVolumeDisplay() {
        const percent = Math.round(audio.volume * 100);
        volumeValue.textContent = percent + '%';
        
        // Обновляем иконку mute
        if (muteBtn) {
            if (isMuted || audio.volume === 0) {
                muteBtn.textContent = '🔇';
            } else if (audio.volume < 0.3) {
                muteBtn.textContent = '🔈';
            } else if (audio.volume < 0.7) {
                muteBtn.textContent = '🔉';
            } else {
                muteBtn.textContent = '🔊';
            }
        }
    }

    // Кнопка mute/unmute
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            if (isMuted) {
                // Unmute - восстанавливаем сохраненную громкость
                audio.volume = lastVolume;
                volumebar.value = lastVolume;
                isMuted = false;
            } else {
                // Mute - сохраняем текущую громкость и обнуляем
                lastVolume = audio.volume;
                audio.volume = 0;
                volumebar.value = 0;
                isMuted = true;
            }
            
            updateVolumeDisplay();
            
            // Сохраняем состояние в localStorage
            localStorage.setItem('playerMuted', isMuted.toString());
            localStorage.setItem('lastVolume', lastVolume.toString());
            
            // Анимация кнопки
            this.classList.add('scale-90');
            setTimeout(() => {
                this.classList.remove('scale-90');
            }, 150);
        });
    }

    // Изменение громкости ползунком
    volumebar.addEventListener('input', function() {
        audio.volume = parseFloat(this.value);
        
        // Если меняем громкость вручную, снимаем mute
        if (isMuted && audio.volume > 0) {
            isMuted = false;
        }
        
        lastVolume = audio.volume;
        updateVolumeDisplay();
        localStorage.setItem('playerVolume', this.value);
    });

    // Загрузка сохраненных настроек громкости
    function loadVolumeSettings() {
        const savedVolume = localStorage.getItem('playerVolume');
        if (savedVolume !== null) {
            const volume = parseFloat(savedVolume);
            audio.volume = volume;
            volumebar.value = volume;
            lastVolume = volume;
        }
        
        const savedMuted = localStorage.getItem('playerMuted');
        if (savedMuted === 'true') {
            const savedLastVolume = localStorage.getItem('lastVolume');
            if (savedLastVolume) {
                lastVolume = parseFloat(savedLastVolume);
            }
            
            isMuted = true;
            audio.volume = 0;
            volumebar.value = 0;
        }
        
        updateVolumeDisplay();
    }
    
    // ==================== TIMEBAR ====================
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    function updateTimebar() {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const percent = (audio.currentTime / audio.duration) * 100;
            timebar.value = percent;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    }

    audio.addEventListener('timeupdate', updateTimebar);
    
    audio.addEventListener('loadedmetadata', function() {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    
    timebar.addEventListener('input', function() {
        if (audio.duration) {
            const seekTime = (this.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    });
    
    timebar.addEventListener('change', function() {
        if (audio.duration) {
            const seekTime = (this.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    });
    
    // ==================== КНОПКИ УПРАВЛЕНИЯ ====================
    
    nextBtn.addEventListener('click', function() {
        currentTrackIndex = getCurrentTrackIndex();
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= trackItems.length) {
            nextIndex = 0;
        }
        playTrackByIndex(nextIndex);
    });
    
    prevBtn.addEventListener('click', function() {
        currentTrackIndex = getCurrentTrackIndex();
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = trackItems.length - 1;
        }
        playTrackByIndex(prevIndex);
    });
    
    playBtn.addEventListener('click', function() {
        if (!currentAudioUrl) { 
            if (trackItems.length > 0) {
                trackItems[0].click();
                return;
            }
        }
        
        if (audio.paused) {
            audio.play();
            isPlaying = true;
            playBtn.textContent = '⏸';
            playBtn.classList.add( 'border-red-700');
        } else {
            audio.pause();
            isPlaying = false;
            playBtn.textContent = '▶';
            playBtn.classList.remove( 'border-red-700');
        }
    });
    
    // ==================== СОБЫТИЯ АУДИО ====================
    
    audio.addEventListener('ended', function() {
        isPlaying = false;
        playBtn.textContent = '▶';
        playBtn.classList.remove('border-red-700');
        
        // Автоматически следующий трек
        setTimeout(() => {
            nextBtn.click();
        }, 500);
    });
    
    audio.addEventListener('pause', function() {
        if (!audio.ended) {
            isPlaying = false;
            playBtn.textContent = '▶';
            playBtn.classList.remove( 'border-red-700');
        }
    });
    
    audio.addEventListener('play', function() {
        isPlaying = true;
        playBtn.textContent = '⏸';
        playBtn.classList.add( 'border-red-700');
    });
    
    // ==================== СОХРАНЕНИЕ И ЗАГРУЗКА ====================
    
    function saveCurrentTrack(name, imageUrl, audioUrl, index) {
        localStorage.setItem('lastTrack', JSON.stringify({
            name: name,
            image: imageUrl,
            audio: audioUrl,    
            index: index,
            timestamp: new Date().getTime()
        }));
    }
    
    function loadLastTrack() {
        const lastTrack = localStorage.getItem('lastTrack');
        if (lastTrack) {
            try {
                const track = JSON.parse(lastTrack);
                const oneDay = 24 * 60 * 60 * 1000;
                if (new Date().getTime() - track.timestamp < oneDay) {
                    if (track.index !== undefined && trackItems[track.index]) {
                        currentTrackIndex = track.index;
                        trackItems[track.index].click();
                    } else {
                        trackItems.forEach(item => {
                            if (item.dataset.trackName === track.name) {
                                item.click();
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Ошибка загрузки последнего трека:", e);
            }
        } else if (trackItems.length > 0) {
            trackItems[0].click();
        }
    }
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    
    loadLastTrack();
    loadVolumeSettings();
    
    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            playBtn.click();
        } else if (e.code === 'ArrowRight') {
            nextBtn.click();
        } else if (e.code === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.code === 'KeyM' && muteBtn) {
            e.preventDefault();
            muteBtn.click();
        }
    });
});