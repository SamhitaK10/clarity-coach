// DOM Elements
const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');

const recordBtn = document.getElementById('record-btn');
const recordingTimer = document.getElementById('recording-timer');
const timerText = document.getElementById('timer-text');

const uploadArea = document.getElementById('upload-area');
const audioInput = document.getElementById('audio-input');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const analyzeBtn = document.getElementById('analyze-btn');
const practiceAgainBtn = document.getElementById('practice-again-btn');
const tryAgainBtn = document.getElementById('try-again-btn');

const errorMessage = document.getElementById('error-message');

let selectedFile = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let timerInterval = null;
let isRecording = false;

// Recording Button Handler
recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
});

// Start Recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            selectedFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

            // Display file info
            fileName.textContent = 'recording.webm';
            fileSize.textContent = formatFileSize(audioBlob.size);
            fileInfo.classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;

        // Update UI
        recordBtn.classList.add('recording');
        recordBtn.querySelector('.record-text').textContent = 'Stop Recording';
        recordingTimer.classList.remove('hidden');

        // Start timer
        recordingStartTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);

    } catch (error) {
        console.error('Recording error:', error);
        showError('Could not access microphone. Please check permissions.');
    }
}

// Stop Recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;

        // Update UI
        recordBtn.classList.remove('recording');
        recordBtn.querySelector('.record-text').textContent = 'Start Recording';
        recordingTimer.classList.add('hidden');

        // Stop timer
        clearInterval(timerInterval);
    }
}

// Update Timer
function updateTimer() {
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timerText.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

    // Auto-stop after 90 seconds
    if (seconds >= 90) {
        stopRecording();
    }
}

// Upload Area Click Handler
uploadArea.addEventListener('click', () => {
    audioInput.click();
});

// Drag and Drop Handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// File Input Change Handler
audioInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// Handle File Selection
function handleFileSelect(file) {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
        showError('Invalid file type. Please upload an audio file.');
        return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File too large. Maximum size is 10MB.');
        return;
    }

    selectedFile = file;

    // Display file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.remove('hidden');
}

// Analyze Button Handler
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        return;
    }

    // Show loading section
    showSection(loadingSection);

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('audio', selectedFile);

        // Update progress (step 1 active)
        updateProgress(1);

        // Call API (Node.js backend on port 3000)
        const response = await fetch('http://localhost:3000/api/transcribe', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }

        const result = await response.json();

        // Display results
        displayResults(result);
        showSection(resultsSection);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    }
});

// Update Progress Steps
function updateProgress(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, index) => {
        if (index < step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

// Display Results
function displayResults(data) {
    const { transcript, feedback, audio } = data;

    // Display transcript
    document.getElementById('transcript-content').textContent = transcript;

    // Display feedback
    document.getElementById('clarity-feedback').textContent = feedback.clarity || 'N/A';
    document.getElementById('grammar-feedback').textContent = feedback.grammar || 'N/A';
    document.getElementById('phrasing-feedback').textContent = feedback.phrasing || 'N/A';
    document.getElementById('filler-feedback').textContent = feedback.fillerWords || 'N/A';

    // Display example sentence
    document.getElementById('example-sentence').textContent = feedback.exampleSentence || '';

    // Display follow-up question
    document.getElementById('followup-question').textContent = feedback.followUp || '';

    // Display voice feedback if available
    if (audio) {
        const voiceSection = document.getElementById('voice-section');
        const voicePlayer = document.getElementById('voice-player');
        voicePlayer.src = audio;
        voiceSection.classList.remove('hidden');
    }
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    showSection(errorSection);
}

// Show Section
function showSection(section) {
    // Hide all sections
    inputSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    // Show selected section
    section.classList.remove('hidden');
}

// Reset to Input
function resetToInput() {
    selectedFile = null;
    audioInput.value = '';
    fileInfo.classList.add('hidden');

    // Reset recording UI
    if (isRecording) {
        stopRecording();
    }
    recordBtn.classList.remove('recording');
    recordBtn.querySelector('.record-text').textContent = 'Start Recording';
    recordingTimer.classList.add('hidden');

    showSection(inputSection);
}

// Button Handlers
practiceAgainBtn.addEventListener('click', resetToInput);
tryAgainBtn.addEventListener('click', resetToInput);

// Utility: Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
