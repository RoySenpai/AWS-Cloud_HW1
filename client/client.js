document.addEventListener('DOMContentLoaded', async () => {
    try {
        const videoListElement = document.getElementById('video-list').querySelector('tbody');
        const videoPlayer = document.getElementById('video-element');
        const videoNameElement = document.getElementById('video-name');
        const selectMessage = document.getElementById('select-message');

        const response = await fetch('http://your-server-api-endpoint/videoList');

        if (!response.ok) {
            throw new Error('Failed to fetch video list');
        }

        const videoFiles = await response.json();

        videoListElement.innerHTML = ''; // Clear the table before adding new rows

        videoFiles.forEach(element => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            let displayName = element.filename.replace(/([A-Z])/g, ' $1').trim();
            // Also trim the .mp4 extension
            displayName = displayName.substring(0, displayName.length - 4);
            cell.textContent = displayName;

            row.appendChild(cell);
            videoListElement.appendChild(row); // Append to tbody

            row.addEventListener('click', () => {
                playVideo(element.url, displayName);
            });
        });

    } catch (error) {
        console.error('Error fetching video list:', error);
    }
});

function playVideo(url, displayName) {
    try {
        const videoPlayer = document.getElementById('video-element');
        const videoNameElement = document.getElementById('video-name');
        const selectMessage = document.getElementById('select-message');

        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.play();

        videoNameElement.textContent = displayName; // Display the formatted name
        selectMessage.style.display = 'none';

        videoPlayer.controls = true; // Show controls
    } catch (error) {
        console.error('Error playing video file:', error);
    }
}