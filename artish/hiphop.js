// Image URLs for each song
const backgroundImages = {
  song1: "hip hop photo/c6f45a64-0e9b-41bd-8e5e-a1837532a1d5.gif",
  song2: "hip hop photo/⁂.gif",
  song3: "hip hop photo/0ac1fd8b-b4c8-4e4f-beba-a0731af461cc.gif",
  song4: "hip hop photo/8d92a8dd-6527-49a5-9536-7091900f6327.gif",
  song5: "hip hop photo/15 FPS.gif",
  song6: "hip hop photo/2668ab56-74d7-4842-ba4e-060acbf207c1.gif",
  song7: "hip hop photo/60237c97-080d-4c52-97ad-6a00f17e8d8b.gif",
  song8: "hip hop photo/Animation Archives — Colossal.gif",
  song9:
    "hip hop photo/Art Animation GIF by charlos_ - Find & Share on GIPHY.gif",
  song10: "hip hop photo/b1a89f2b-9a24-46c4-9429-7da32e4c4c8f.gif",
  song11: "hip hop photo/bird.gif",
  song12: "hip hop photo/- Find & Share on GIPHY.gif",
  song13: "hip hop photo/Captivity.gif",
  song14: "hip hop photo/e88d37e9-97ac-4127-8ba7-518a2efb8204.gif",
  song15: "hip hop photo/Inkygoodness.gif",
  song16: "hip hop photo/Lucjan.gif",
  song17: "hip hop photo/SHIFTS.gif",
  song18: "hip hop photo/The gorgeous, surreal GIFs of Adam Pizurny.gif",
  song19: "hip hop photo/The Me Bird.gif",
  song20: "hip hop photo/Wind.gif",
  song21: "hip hop photo/Zedd ft_ Troye Sivan - Papercut.gif",
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
