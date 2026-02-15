// DOM Elements
const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');

const uploadArea = document.getElementById('upload-area');
const videoInput = document.getElementById('video-input');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeAnotherBtn = document.getElementById('analyze-another-btn');
const tryAgainBtn = document.getElementById('try-again-btn');

const errorMessage = document.getElementById('error-message');

let selectedFile = null;

// Upload Area Click Handler
uploadArea.addEventListener('click', () => {
    videoInput.click();
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
videoInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// Handle File Selection
function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload MP4, AVI, MOV, or WEBM video.');
        return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File too large. Maximum size is 50MB.');
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
        formData.append('file', selectedFile);

        // Call API (Python backend on port 8000)
        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Analysis failed');
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

// Display Results
function displayResults(data) {
    const { metrics, feedback, frame_count } = data;

    // Update metric values and progress bars
    updateMetric('eye-contact', metrics.eye_contact_score);
    updateMetric('posture', metrics.posture_score);
    updateMetric('gesture', metrics.gesture_score);

    // Update feedback
    const feedbackContent = document.getElementById('feedback-content');
    feedbackContent.textContent = feedback;

    // Update meta info
    document.getElementById('frame-count').textContent = frame_count || 'N/A';
}

// Update Metric Display
function updateMetric(metricName, score) {
    const valueElement = document.getElementById(`${metricName}-value`);
    const barElement = document.getElementById(`${metricName}-bar`);

    // Animate value
    let currentValue = 0;
    const targetValue = Math.round(score);
    const duration = 1000; // 1 second
    const steps = 50;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
        }
        valueElement.textContent = Math.round(currentValue);
    }, stepDuration);

    // Update progress bar
    barElement.style.width = `${score}%`;

    // Color code based on score
    if (score >= 70) {
        barElement.style.backgroundColor = '#10b981'; // Green
    } else if (score >= 40) {
        barElement.style.backgroundColor = '#f59e0b'; // Orange
    } else {
        barElement.style.backgroundColor = '#ef4444'; // Red
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
    uploadSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    // Show selected section
    section.classList.remove('hidden');
}

// Reset to Upload
function resetToUpload() {
    selectedFile = null;
    videoInput.value = '';
    fileInfo.classList.add('hidden');
    showSection(uploadSection);
}

// Button Handlers
analyzeAnotherBtn.addEventListener('click', resetToUpload);
tryAgainBtn.addEventListener('click', resetToUpload);

// Utility: Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
