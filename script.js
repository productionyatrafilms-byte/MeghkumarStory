let player;
const toggleBtn = document.getElementById("mainToggleBtn");
const wrapper = document.getElementById("ytWrapper");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const timeDisplay = document.getElementById("timeDisplay");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const volumeSlider = document.getElementById("volumeSlider");
const volIcon = document.getElementById("volIcon");

// Settings Elements
// const settingsBtn = document.getElementById("settingsBtn");
// const qualityMenu = document.getElementById("qualityMenu");
// const qualityOptions = document.querySelectorAll(".quality-option");
// https://youtu.be/dRU3jNCteAQ?si=AWZeTcMdL1rIyqtO
// Load YouTube API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player("ytPlayer", {
    height: "100%",
    width: "100%",
    videoId: "dRU3jNCteAQ`",
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin, // Add this line to fix the 'postMessage' error
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

let isPlayerReady = false;

// function onPlayerReady(event) {
//   isPlayerReady = true;
//   wrapper.classList.remove("loading");
//   setInterval(updateProgress, 100);
//   player.setVolume(volumeSlider.value);
//   console.log("YouTube Player is fully initialized.");
// }
function onPlayerReady(event) {
  if (typeof event.target.setPlaybackQualityRange === "function") {
    // Setting both min and max to 'hd720' forces the player to prefer HD
    event.target.setPlaybackQualityRange("hd720", "hd720");
  }
  isPlayerReady = true;
  wrapper.classList.remove("loading");
  setInterval(updateProgress, 100);
  player.setVolume(volumeSlider.value);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    toggleBtn.innerHTML = '<i class="bi bi-pause"></i>';
  } else {
    toggleBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
  }
}

function updateProgress() {
  if (player && player.getCurrentTime) {
    const current = player.getCurrentTime();
    const total = player.getDuration();
    if (total > 0) {
      const pct = (current / total) * 100;
      progressBar.style.width = pct + "%";
      const format = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
      };
      timeDisplay.textContent = `${format(current)} / ${format(total)}`;
    }
  }
}

// Play/Pause Toggle
toggleBtn.addEventListener("click", () => {
  const state = player.getPlayerState();
  state === YT.PlayerState.PLAYING ? player.pauseVideo() : player.playVideo();
});

function updateVolumeSliderFill(slider) {
  const min = Number(slider.min || 0);
  const max = Number(slider.max || 100);
  const val = Number(slider.value);
  const pct = ((val - min) / (max - min)) * 100;

  slider.style.background = `linear-gradient(
    to right,
    #FF6B35 0%,
    #e13202 ${pct}%,
    #ffffff ${pct}%,
    #ffffff 100%
  )`;
}

// Volume Control
volumeSlider.addEventListener("input", (e) => {
  const val = Number(e.target.value);
  player.setVolume(val);
  updateVolumeSliderFill(e.target);
  volIcon.className = `bi ${
    val === 0
      ? "bi-volume-mute-fill"
      : val < 50
      ? "bi-volume-down-fill"
      : "bi-volume-up-fill"
  }`;
});

// Seek Functionality
progressContainer.addEventListener("click", (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  player.seekTo(pos * player.getDuration());
});

// Fullscreen Logic
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen().catch((err) => alert(err.message));
  } else {
    document.exitFullscreen();
  }
});

const fullscreenIcon = document.getElementById("fullscreenIcon");
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenIcon.className = "bi bi-fullscreen-exit";
    fullscreenBtn.title = "Exit Fullscreen";
  } else {
    fullscreenIcon.className = "bi bi-fullscreen";
    fullscreenBtn.title = "Enter Fullscreen";
  }
});

// Click on video to Play/Pause
const ytFrameContainer = document.querySelector(".yt-frame-container");
ytFrameContainer.addEventListener("click", () => {
  if (player && player.getPlayerState) {
    const state = player.getPlayerState();
    state === YT.PlayerState.PLAYING ? player.pauseVideo() : player.playVideo();
  }
});

// --- Translation Logic ---
const buttons = {
  English: document.getElementById("englishButton"),
  Hindi: document.getElementById("hindiButton"),
  Gujrati: document.getElementById("gujaratiButton"),
};

Object.keys(buttons).forEach((lang) => {
  buttons[lang].addEventListener("click", () => {
    updateText(lang);
    updateButtonStyles(lang);
  });
});

function updateButtonStyles(selectedLang) {
  Object.keys(buttons).forEach((lang) => {
    if (lang === selectedLang) {
      buttons[lang].classList.add("active-lang");
    } else {
      buttons[lang].classList.remove("active-lang");
    }
  });
}

function updateText(language) {
  const h1 = document.querySelector("nav h1");
  const fallbacks = {
    English: "Meghkumar Story",
    Hindi: "मेघकुमार कहानी",
    Gujrati: "મેઘકુમાર વાર્તા",
  };

  fetch("new1/json/data.json")
    .then((res) => res.json())
    .then((data) => {
      if (data[language]) h1.textContent = data[language].title;
    })
    .catch(() => {
      h1.textContent = fallbacks[language];
    });
}

// Initial active state
updateButtonStyles("English");

// --- Quality Selection Menu Logic ---
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  qualityMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
  qualityMenu.classList.remove("show");
});
