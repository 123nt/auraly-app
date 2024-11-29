  // Update the navigation event listeners
window.addEventListener("popstate", function (event) {
  const currentSection = getCurrentSection();
  if (currentSection) showSection(currentSection);
});

// Helper function to get current section
function getCurrentSection() {
  return ["home", "search", "about", "explore"].find(
    (section) =>
      document.getElementById(section + "Section").style.display ===
      "block"
  );
}

// Global variables
let currentPlayingSong = null;
let currentPlayingSongId = null;
let currentAlbumCover = null;
let isDragging = false;
let searchInput;

// Perform search function
async function performSearch(query) {
  console.log("Starting search with query:", query);
  const mainContent = document.getElementById("mainContent");
  const songsContainer = document.getElementById("songsContainer");
  const songDetailsPanel = document.getElementById("songDetailsPanel");

  if (!query.trim()) {
    console.log("Empty query, returning");
    mainContent.classList.remove("has-results");
    songsContainer.classList.remove("visible");
    return;
  }

  try {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key":
          "903be63565mshedcf652879b28c0p126a8cjsnd125834c310b",
        "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
      },
    };

    console.log("Fetching data from API...");
    const response = await fetch(
      `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(
        query
      )}`,
      options
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);

    if (!data || !data.data) {
      throw new Error("Invalid response data");
    }

    // Change page background color using your specified colors
    const newColor = getLightColor();
    document.body.style.transition = "background-color 0.5s ease-in-out";
    document.body.style.backgroundColor = newColor;
    document.querySelector(".bottom-nav").style.background = newColor;
    document.querySelector("#searchInput").style.background = newColor;
    document.querySelector("#searchButton").style.background = newColor;

    // Make playlist button darker version of the same color
    const playlistButtons = document.querySelectorAll(".playlist-btn");
    playlistButtons.forEach((btn) => {
      btn.style.transition = "background-color 0.5s ease-in-out";
      const rgb = hexToRgb(newColor);
      const darkerColor = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
        0,
        rgb.g - 30
      )}, ${Math.max(0, rgb.b - 30)})`;
      btn.style.backgroundColor = darkerColor;
    });

    // Update side panel background
    songDetailsPanel.style.backgroundColor = newColor;

    songsContainer.innerHTML = "";

    data.data.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.className = "song";
      songElement.id = `song-${index}`;
      songElement.style.setProperty("--animation-order", index);

      songElement.innerHTML = `
        <button class="info-icon" onclick="showSongDetails(event, '${song.title}', '${song.artist.name}', '${song.album.title}', '${song.album.cover_medium}')">
          <i class="fas fa-info"></i>
        </button>
        <img src="${song.album.cover_medium}" alt="${song.title}" />
        <div class="song-details">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist.name}</div>
        </div>
        <audio class="audio-element" src="${song.preview}"></audio>
      `;

      songElement.addEventListener("click", (e) => {
        // Don't trigger play if info button was clicked
        if (!e.target.closest(".info-icon")) {
          togglePlay(`song-${index}`, song.album.cover_medium);
        }
      });
      songsContainer.appendChild(songElement);
    });

    if (data.data.length > 0) {
      mainContent.classList.add("has-results");
      songsContainer.classList.add("visible");
    } else {
      mainContent.classList.remove("has-results");
      songsContainer.classList.remove("visible");
    }
  } catch (error) {
    mainContent.classList.remove("has-results");
    songsContainer.classList.remove("visible");
    console.error("Search error:", error);
    alert("Failed to search for songs. Please try again later.");
  }
}

// Toggle play function
function togglePlay(songId, albumCover) {
  console.log("Attempting to play/pause song:", songId);
  const songElement = document.getElementById(songId);
  if (!songElement) {
    console.error("Song element not found:", songId);
    return;
  }

  const audioElement = songElement.querySelector(".audio-element");
  if (!audioElement) {
    console.error("Audio element not found in song:", songId);
    return;
  }

  console.log(
    "Current audio state:",
    audioElement.paused ? "paused" : "playing"
  );

  if (currentPlayingSong && currentPlayingSong !== audioElement) {
    currentPlayingSong.pause();
    currentPlayingSong.currentTime = 0;
    document.querySelectorAll(".song").forEach((s) => {
      s.classList.remove("playing");
      const infoIcon = s.querySelector(".info-icon");
      infoIcon.classList.remove("show");
    });
  }

  if (audioElement.paused) {
    const songTitle =
      songElement.querySelector(".song-title").textContent;
    const songArtist =
      songElement.querySelector(".song-artist").textContent;
    const songAlbum = songElement
      .closest(".song")
      .querySelector(".song-details").textContent;

    updateSongDetailsPanel(songTitle, songArtist, songAlbum, albumCover);

    // Automatically open side panel on desktop/laptop only when search results are shown
    if (window.innerWidth >= 1024) {
      const mainContent = document.getElementById("mainContent");
      const songsContainer = document.getElementById("songsContainer");
      if (mainContent.classList.contains("has-results") && songsContainer.classList.contains("visible")) {
        const songDetailsPanel = document.getElementById("songDetailsPanel");
        songDetailsPanel.classList.add("active");
      }
    }

    audioElement.play();
    songElement.classList.add("playing");
    const infoIcon = songElement.querySelector(".info-icon");
    infoIcon.classList.add("show");
    
    currentPlayingSong = audioElement;
    currentPlayingSongId = songId;
    currentAlbumCover = albumCover;

    updatePlayPauseButton(true);

    audioElement.addEventListener("ended", () => {
      songElement.classList.remove("playing");
      const infoIcon = songElement.querySelector(".info-icon");
      infoIcon.classList.remove("show");
      currentPlayingSong = null;
      currentPlayingSongId = null;
      currentAlbumCover = null;
      updatePlayPauseButton(false);
      if (window.innerWidth >= 1024) {
        const songDetailsPanel = document.getElementById("songDetailsPanel");
        songDetailsPanel.classList.remove("active");
      }
      playNextSong();
    });

    audioElement.addEventListener("timeupdate", () => {
      if (!isDragging) {
        updateSideProgress(audioElement);
      }
    });
  } else {
    audioElement.pause();
    songElement.classList.remove("playing");
    const infoIcon = songElement.querySelector(".info-icon");
    infoIcon.classList.remove("show");
    updatePlayPauseButton(false);
    
    if (window.innerWidth >= 1024) {
      const songDetailsPanel = document.getElementById("songDetailsPanel");
      songDetailsPanel.classList.remove("active");
    }
  }
}

// Update play pause button function
function updatePlayPauseButton(isPlaying) {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = playPauseBtn.querySelector(".play-icon");
  const pauseIcon = playPauseBtn.querySelector(".pause-icon");

  if (isPlaying) {
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
    playPauseBtn.classList.add("playing");
  } else {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
    playPauseBtn.classList.remove("playing");
  }
}

// Update song details panel function
function updateSongDetailsPanel(title, artist, album, albumCover) {
  const panel = document.getElementById("songDetailsPanel");
  panel.querySelector(".album-cover").src = albumCover;
  panel.querySelector(".song-title").textContent = title;
  panel.querySelector(".song-artist").textContent = artist;
  panel.querySelector(".song-album").textContent = album;
}

// Show song details function
function showSongDetails(event, title, artist, album, albumCover) {
  event.stopPropagation(); // Prevent song from playing when clicking info
  const songDetailsPanel = document.getElementById("songDetailsPanel");

  // Update panel content
  songDetailsPanel.querySelector(".album-cover").src = albumCover;
  songDetailsPanel.querySelector(".song-title").textContent = title;
  songDetailsPanel.querySelector(".song-artist").textContent = artist;
  songDetailsPanel.querySelector(".song-album").textContent = album;

  // Show the panel
  songDetailsPanel.classList.add("active");

  // Setup close button
  songDetailsPanel.querySelector(".close-btn").onclick = () => {
    songDetailsPanel.classList.remove("active");
  };
}

// Play next song function
function playNextSong() {
  const songs = document.querySelectorAll('.song');
  let currentIndex = Array.from(songs).findIndex(song => song.id === currentPlayingSongId);
  
  if (currentIndex === -1) return;
  
  const newIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  const nextSong = songs[newIndex];
  const albumCover = nextSong.querySelector('img').src;
  togglePlay(nextSong.id, albumCover);
}

// Play previous song function
function playPreviousSong() {
  const songs = document.querySelectorAll('.song');
  let currentIndex = Array.from(songs).findIndex(song => song.id === currentPlayingSongId);
  
  if (currentIndex === -1) return;
  
  const newIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
  const previousSong = songs[newIndex];
  const albumCover = previousSong.querySelector('img').src;
  togglePlay(previousSong.id, albumCover);
}

// Show section function
function showSection(section) {
  // Update theme color
  const newColor = getLightColor();
  document.body.style.backgroundColor = newColor;
  document.querySelector(".bottom-nav").style.background = newColor;
  document.querySelector("#searchInput").style.background = newColor;
  document.querySelector("#searchButton").style.background = newColor;

  // Make playlist button darker version of the same color
  const playlistButtons = document.querySelectorAll(".playlist-btn");
  playlistButtons.forEach((btn) => {
    btn.style.transition = "background-color 0.5s ease-in-out";
    const rgb = hexToRgb(newColor);
    const darkerColor = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
      0,
      rgb.g - 30
    )}, ${Math.max(0, rgb.b - 30)})`;
    btn.style.backgroundColor = darkerColor;
  });

  // Update nav links color
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.style.transition = "all 0.3s ease";
    link.style.color = "inherit";
    link.classList.remove("active");
  });

  // First remove active classes from all sections
  const homeSection = document.getElementById("homeSection");
  const mainContent = document.getElementById("mainContent");
  const aboutSection = document.getElementById("aboutSection");
  const exploreSection = document.getElementById("exploreSection");

  homeSection.classList.remove("active");
  mainContent.classList.remove("active");
  aboutSection.classList.remove("active");
  exploreSection.classList.remove("active");

  // Add a small delay before showing the new section
  setTimeout(() => {
    // Hide all sections first
    homeSection.style.display = "none";
    mainContent.style.display = "none";
    aboutSection.style.display = "none";
    exploreSection.style.display = "none";

    // Show selected section and update nav link
    switch (section) {
      case "about":
        aboutSection.style.display = "block";
        aboutSection.offsetHeight;
        aboutSection.classList.add("active");
        navLinks[2].classList.add("active");
        break;
      case "home":
        homeSection.style.display = "block";
        homeSection.offsetHeight;
        homeSection.classList.add("active");
        navLinks[0].classList.add("active");
        // Clear search results when going home
        document.getElementById("songsContainer").innerHTML = "";
        document.getElementById("searchInput").value = "";
        break;
      case "explore":
        exploreSection.style.display = "block";
        exploreSection.offsetHeight;
        exploreSection.classList.add("active");
        break;
      default:
        mainContent.style.display = "block";
        mainContent.offsetHeight;
        mainContent.classList.add("active");
        navLinks[1].classList.add("active");
    }
  }, 50);
}

// Get light color function
function getLightColor() {
  // Your specified colors for page background
  const lightColors = [
    "#EEE0CA",
    "#E1CCB7",
    "#DDBEA5",
    "#E5DFC3",
    "#DDC6C6",
    "#D2A993",
    "#B1AC7A",
    "#EFEDC3",
    "#CCCCCC",
    "#9E8977",
    "#A4A191",
    "#B2B1A9",
    "#BDBEBA",
    "#F2F2F1",
    "#C6C1BB",
  ];
  return lightColors[Math.floor(Math.random() * lightColors.length)];
}

// Hex to RGB function
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate progress function
function calculateProgress(current, duration) {
  return (current / duration) * 100;
}

// Update side progress function
function updateSideProgress(audio) {
  console.log("Updating progress");
  if (!progressBar || !currentTimeEl || !durationTimeEl) {
    console.warn("Progress bar elements not found:", {
      progressBar: !!progressBar,
      currentTimeEl: !!currentTimeEl,
      durationTimeEl: !!durationTimeEl,
    });
    return;
  }

  if (!audio || !Number.isFinite(audio.duration)) {
    console.warn("Invalid audio duration");
    return;
  }

  const current = audio.currentTime;
  const duration = audio.duration;
  const progressPercent = calculateProgress(current, duration);
  console.log("Progress:", { current, duration, progressPercent });

  progressBar.style.width = `${progressPercent}%`;
  currentTimeEl.textContent = formatTime(current);
  durationTimeEl.textContent = formatTime(duration);
}

// Format time function
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Update progress from event function
function updateProgressFromEvent(e) {
  if (!currentPlayingSong) return;
  const progressRect = document
    .querySelector(".side-progress")
    .getBoundingClientRect();
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  const clickPosition = Math.max(
    0,
    Math.min(1, (x - progressRect.left) / progressRect.width)
  );
  currentPlayingSong.currentTime =
    clickPosition * currentPlayingSong.duration;
  updateSideProgress(currentPlayingSong);
}

// Handle search function
function handleSearch() {
  if (!searchInput) {
    searchInput = document.getElementById("searchInput");
  }
  const query = searchInput.value.trim();
  if (query) performSearch(query);
}

// Cache progress bar elements
let progressBar, currentTimeEl, durationTimeEl;

// Document event listener
document.addEventListener("DOMContentLoaded", () => {
  // Cache progress elements
  progressBar = document.querySelector(".side-progress-bar");
  currentTimeEl = document.querySelector(".current-time");
  durationTimeEl = document.querySelector(".duration-time");
  searchInput = document.getElementById("searchInput");

  // Set home as active by default
  showSection("home");

  const searchButton = document.getElementById("searchButton");

  // Progress bar drag functionality
  const progressContainer = document.querySelector(".side-progress");
  let isDragging = false;

  if (progressContainer) {
    progressContainer.addEventListener("mousedown", function (e) {
      isDragging = true;
      updateProgressFromEvent(e);
    });

    document.addEventListener("mousemove", function (e) {
      if (isDragging && currentPlayingSong) {
        e.preventDefault(); // Prevent text selection while dragging
        updateProgressFromEvent(e);
      }
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
    });

    // Also handle touch events for mobile
    progressContainer.addEventListener("touchstart", function (e) {
      isDragging = true;
      updateProgressFromEvent(e.touches[0]);
    });

    document.addEventListener("touchmove", function (e) {
      if (isDragging && currentPlayingSong) {
        e.preventDefault();
        updateProgressFromEvent(e.touches[0]);
      }
    });

    document.addEventListener("touchend", function () {
      isDragging = false;
    });

    // Simple click to seek
    progressContainer.addEventListener("click", function (e) {
      if (currentPlayingSong) {
        updateProgressFromEvent(e);
      }
    });
  }

  searchButton.addEventListener("click", handleSearch);

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Add event listener for the previous button
  document.querySelector('.previous-button').addEventListener('click', playPreviousSong);
});

// Deferred prompt
let deferredPrompt;

// Handle install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Create install buttons immediately when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Create floating button
  const floatingInstallBtn = document.createElement("button");
  floatingInstallBtn.textContent = "📱 Install Auraly";
  floatingInstallBtn.classList.add("floating-install-button");
  floatingInstallBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: 12px 24px;
    background: #B3C8CF;
    border: none;
    border-radius: 25px;
    color: black;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: block;
    transition: all 0.3s ease;
    font-size: 16px;
    font-weight: 500;
  `;

  // Check if the app is installed on any device
  if (window.matchMedia("(display-mode: standalone)").matches) {
    floatingInstallBtn.style.display = "none"; // Hide button if installed
  }

  floatingInstallBtn.addEventListener("mouseover", () => {
    floatingInstallBtn.style.transform = "scale(1.05)";
    floatingInstallBtn.style.background = "#c79881";
  });

  floatingInstallBtn.addEventListener("mouseout", () => {
    floatingInstallBtn.style.transform = "scale(1)";
    floatingInstallBtn.style.background = "#D2A993";
  });

  floatingInstallBtn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
        deferredPrompt = null;
      });
    } else {
      alert(
        "To install the app: \n1. On Desktop: Click the install icon in your browser's address bar\n2. On Mobile: Add to Home Screen from your browser menu"
      );
    }
  });

  document.body.appendChild(floatingInstallBtn);
});