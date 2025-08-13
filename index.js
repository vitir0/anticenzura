const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Настройки запросов
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Улучшенный Веб-Прокси</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #1a2980, #26d0ce);
      color: white;
      min-height: 100vh;
      padding: 20px;
      position: relative;
    }
    .container {
      max-width: 1000px;
      margin: 20px auto;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
      font-size: 24px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      outline: none;
    }
    input::placeholder {
      color: #aaa;
    }
    button {
      padding: 12px 20px;
      background: #3494e6;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      min-width: 100px;
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .video-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 */
      height: 0;
      display: none;
      margin-bottom: 15px;
    }
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 5px;
    }
    iframe {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 5px;
      background: white;
    }
    .error {
      color: #ff6b6b;
      text-align: center;
      padding: 15px;
      margin-top: 20px;
      border-radius: 5px;
      background: rgba(255, 0, 0, 0.1);
    }
    .loading {
      text-align: center;
      padding: 20px;
      display: none;
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .fullscreen-btn {
      background: #ff4b2b;
    }
    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1000;
      background: black;
      padding: 0;
      margin: 0;
      border-radius: 0;
    }
    .fullscreen iframe {
      height: 100vh;
      border-radius: 0;
    }
    .fullscreen .video-container {
      height: 100vh;
    }
    .fullscreen .controls {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1001;
    }
    .youtube-warning {
      background: rgba(255, 0, 0, 0.2);
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      text-align: center;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Улучшенный Веб-Прокси</h1>
    
    <div class="form-group">
      <input 
        type="text" 
        id="urlInput" 
        placeholder="https://youtube.com" 
        autocomplete="off"
        value="https://youtube.com"
      >
      <button id="openBtn">Открыть</button>
    </div>

    <div class="youtube-warning" id="youtubeWarning">
      <p>Для YouTube используйте кнопку "Показать видео"</p>
    </div>

    <div class="loading" id="loading">
      <div class="loader"></div>
      <p>Загрузка...</p>
    </div>

    <div class="controls">
      <button id="showVideoBtn">Показать видео</button>
      <button id="fullscreenBtn" class="fullscreen-btn">Полный экран</button>
      <button id="exitFullscreenBtn" class="fullscreen-btn" style="display:none;">Выйти</button>
      <button id="newTabBtn">Новая вкладка</button>
      <button id="refreshBtn">Обновить</button>
    </div>

    <div class="video-container" id="videoContainer">
      <iframe id="videoFrame" allowfullscreen></iframe>
    </div>

    <iframe id="proxyFrame" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>

    <div class="error" id="errorContainer"></div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Элементы страницы
      const openBtn = document.getElementById('openBtn');
      const urlInput = document.getElementById('urlInput');
      const proxyFrame = document.getElementById('proxyFrame');
      const videoContainer = document.getElementById('videoContainer');
      const videoFrame = document.getElementById('videoFrame');
      const loading = document.getElementById('loading');
      const errorContainer = document.getElementById('errorContainer');
      const newTabBtn = document.getElementById('newTabBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const showVideoBtn = document.getElementById('showVideoBtn');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
      const youtubeWarning = document.getElementById('youtubeWarning');
      const container = document.querySelector('.container');
      
      // Текущий URL
      let currentUrl = 'https://youtube.com';
      let videoId = null;

      // Показать ошибку
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        loading.style.display = 'none';
      }
      
      // Загрузить URL
      function loadUrl(url) {
        loading.style.display = 'block';
        errorContainer.style.display = 'none';
        videoContainer.style.display = 'none';
        youtubeWarning.style.display = 'none';
        
        // Автокоррекция URL
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        
        currentUrl = url;
        urlInput.value = url;
        
        // Для YouTube используем мобильную версию
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const id = getYouTubeId(url);
          if (id) {
            videoId = id;
            youtubeWarning.style.display = 'block';
          }
          url = url.replace('youtube.com', 'm.youtube.com');
        }
        
        proxyFrame.src = '/proxy?url=' + encodeURIComponent(url);
      }
      
      // Получить YouTube ID
      function getYouTubeId(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      }
      
      // Показать видео YouTube
      function showYouTubeVideo() {
        if (!videoId) {
          showError('Видео не найдено');
          return;
        }
        
        videoFrame.src = 'https://www.youtube.com/embed/' + videoId;
        videoContainer.style.display = 'block';
        proxyFrame.style.display = 'none';
      }
      
      // Обработчики событий
      openBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (!url) {
          showError('Введите URL');
          return;
        }
        loadUrl(url);
      });
      
      proxyFrame.addEventListener('load', function() {
        loading.style.display = 'none';
        proxyFrame.style.display = 'block';
        videoContainer.style.display = 'none';
      });
      
      proxyFrame.addEventListener('error', function() {
        showError('Ошибка загрузки сайта');
      });
      
      newTabBtn.addEventListener('click', function() {
        window.open(currentUrl, '_blank');
      });
      
      refreshBtn.addEventListener('click', function() {
        proxyFrame.contentWindow.location.reload();
      });
      
      showVideoBtn.addEventListener('click', showYouTubeVideo);
      
      // Полноэкранный режим
      function enterFullscreen() {
        container.classList.add('fullscreen');
        fullscreenBtn.style.display = 'none';
        exitFullscreenBtn.style.display = 'block';
        
        if (videoContainer.style.display === 'block') {
          videoContainer.style.height = '100vh';
        }
      }
      
      function exitFullscreen() {
        container.classList.remove('fullscreen');
        fullscreenBtn.style.display = 'block';
        exitFullscreenBtn.style.display = 'none';
        
        if (videoContainer.style.display === 'block') {
          videoContainer.style.height = '0';
        }
      }
      
      fullscreenBtn.addEventListener('click', enterFullscreen);
      exitFullscreenBtn.addEventListener('click', exitFullscreen);
      
      // Автоматическая загрузка YouTube при старте
      loadUrl('https://youtube.com');
    });
  </script>
</body>
</html>
  `);
});

// Прокси-обработчик с поддержкой YouTube
app.get('/proxy', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL required');

    // Автокоррекция URL
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Для YouTube используем мобильную версию
    if (targetUrl.includes('youtube.com')) {
      targetUrl = targetUrl.replace('www.youtube.com', 'm.youtube.com');
    }
    
    // Загружаем контент
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: status => status < 500
    });
    
    // Определяем Content-Type
    const contentType = response.headers['content-type'] || 'text/html';
    
    // Устанавливаем заголовки
    res.set('Content-Type', contentType);
    
    // Возвращаем контент как есть
    res.send(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px;">
        <h3>Ошибка прокси</h3>
        <p>${error.message}</p>
        <p><a href="/">Вернуться</a></p>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
