// Image URLs for each song
const backgroundImages = {
  song1: "country photo/8f01ddd7-0cc0-4848-a70e-c027144b385e.gif",
  song2: "country photo/download (2).gif",
  song3: "country photo/Light & Shadow Cycle.gif",
  song4: "country photo/Best Animations.gif",
  song5: "country photo/0093e503-a4bf-422f-9846-fbf45b4bcf67.gif",
  song6: "country photo/8d722406-974c-4139-9eee-e92164555506.gif",
  song7: "country photo/cdad550c-7534-4996-b1ea-64b05e456bbf.gif",
  song8: "country photo/8348e7f1-7507-4b0a-af84-e0489cfd2e58.gif",
  song9: "country photo/76b23c06-bd44-4424-aa4c-75e913c10e23.gif",
  song10:
    "country photo/Vanishing Thoughts Explored in High Contrast GIFs by Tracy J Lee — Colossal.gif",
  song11: "country photo/Source unknown - would love to give credit!.gif",
  song12:
    "country photo/Vanishing Thoughts Explored in High Contrast GIFs by Tracy J Lee.gif",
  song13:
    "country photo/coldplay lyric GIF by Columbia Records - Find & Share on GIPHY.gif",
  song14: "country photo/f7fbfd13-d5e9-4503-b309-f4edc2cc9ea3.gif",
  song15: "country photo/Chefsfeed.gif",
  song16: "IMAGE/392b7bbf-386f-4c56-bd54-9111075f1a41.gif",
  song17: "country photo/animated gifs.gif",
  song18: "country photo/ba5caa27-0b3e-4476-b8b0-bd9e63444956.gif",
  song19: "country photo/2a1e4d19-32c0-4c49-ae23-3db9cc6d7e46.gif",
  song20:
    "country photo/Building and organizing a contract - Illustrations.gif",
  song21: "country photo/Register - Login.gif",
  // Add more URLs for each song as needed, up to song20
};

let currentlyPlayingAudio = null;
let currentlyPlayingContainer = null;
let isDragging = false; // Flag to track if the user is dragging the progress bar

function togglePlay(songId) {
  const bgContainer = document.getElementById("backgroundImage");
  const audio = document.getElementById(`audio${songId.replace("song", "")}`);
  const progressContainer = document.getElementById(songId);
  const songElement = progressContainer.parentElement;

  // Pause the current song if another one is clicked
  if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
    currentlyPlayingAudio.pause();
    if (!isDragging) {
      currentlyPlayingContainer.style.display = "none";
      currentlyPlayingContainer.parentElement.classList.remove("playing");
    }
    bgContainer.classList.remove("background-image-active"); // Hide background when previous song is paused
  }

  if (audio.paused) {
    audio.play();
    progressContainer.style.display = "block";
    songElement.classList.add("playing");
    // Set and show background image for the selected song
    if (backgroundImages[songId]) {
      bgContainer.style.backgroundImage = `url('${backgroundImages[songId]}')`;
      bgContainer.classList.add("background-image-active");
    }
  } else {
    audio.pause();
    progressContainer.style.display = "none";
    songElement.classList.remove("playing");
    bgContainer.classList.remove("background-image-active"); // Hide background when song is paused
  }

  currentlyPlayingAudio = audio;
  currentlyPlayingContainer = progressContainer;

  // Start updating progress if the audio is playing
  if (!audio.paused) {
    updateProgress(audio, songId);
  }
}

function getNextSongId(currentSongId) {
  const currentIndex = parseInt(currentSongId.replace("song", ""));
  const nextIndex = currentIndex + 1;
  return nextIndex <= 20 ? `song${nextIndex}` : null;
}

function updateProgress(audio, songId) {
  const progress = document.getElementById(
    `progress${songId.replace("song", "")}`
  );
  const durationLabel = document.getElementById(
    `duration${songId.replace("song", "")}`
  );

  // Update progress and time display
  audio.addEventListener("timeupdate", () => {
    if (!isDragging) {
      // Update progress only if not dragging
      const duration = audio.duration || 0;
      const currentTime = audio.currentTime || 0;
      const progressValue = (currentTime / duration) * 100;
      progress.value = progressValue;

      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60)
        .toString()
        .padStart(2, "0");
      durationLabel.textContent = `${minutes}:${seconds}`;
    }
  });

  // Set flag when dragging starts
  progress.addEventListener("mousedown", () => {
    isDragging = true;
  });

  // Allow user to seek by clicking on the progress bar
  progress.addEventListener("input", (event) => {
    const newTime = (event.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
  });

  // Reset flag when dragging stops
  progress.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
