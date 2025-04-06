document.addEventListener('DOMContentLoaded', () => {
    // Create curved text
    function createCurvedText() {
        const text = "Pomo timer";
        const curvedTextDiv = document.getElementById('curved-text');
        const totalAngle = 100; // Reduced from 180 for tighter spacing
        const startAngle = -54; // Adjusted start angle
        
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            const angle = startAngle + (i * (totalAngle / (text.length - 1)));
            span.style.transform = `rotate(${angle}deg)`;
            curvedTextDiv.appendChild(span);
        });
    }

    createCurvedText();

    const addTaskBtn = document.getElementById('add-task-btn');
    const activeTasksList = document.getElementById('active-tasks');
    const archivedTasksList = document.getElementById('archived-tasks');
    let taskInput = null;

    // Load tasks from localStorage
    function loadTasks() {
        const activeTasks = JSON.parse(localStorage.getItem('activeTasks') || '[]');
        const archivedTasks = JSON.parse(localStorage.getItem('archivedTasks') || '[]');

        // Create active tasks
        activeTasks.forEach(text => createTask(text, false));
        
        // Create archived tasks
        archivedTasks.forEach(text => {
            const task = createTask(text, true);
            task.classList.add('completed');
            archivedTasksList.appendChild(task);
        });
    }

    // Save tasks to localStorage
    function saveTasks() {
        const activeTasks = Array.from(activeTasksList.children).map(task => 
            task.querySelector('.task-text').textContent
        );
        const archivedTasks = Array.from(archivedTasksList.children).map(task => 
            task.querySelector('.task-text').textContent
        );

        localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
        localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
    }

    // Create SVG checkmark template
    const createCheckmark = () => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.classList.add("checkmark-path");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M4 12.5L9 17.5L20 6.5");
        svg.appendChild(path);
        
        return svg;
    };

    addTaskBtn.addEventListener('click', () => {
        if (taskInput) {
            taskInput.remove();
        }

        taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.id = 'add-task-input';
        taskInput.placeholder = 'Type your task and press Enter';
        
        const header = document.querySelector('.header');
        header.insertAdjacentElement('afterend', taskInput);
        
        taskInput.style.display = 'block';
        taskInput.focus();

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && taskInput.value.trim()) {
                createTask(taskInput.value.trim(), false);
                taskInput.value = '';
                taskInput.style.display = 'none';
                saveTasks();
            }
        });
    });

    function createTask(text, isArchived = false) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        
        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.textContent = text;

        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-times delete-task';
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteBtn);

        if (!isArchived) {
            activeTasksList.appendChild(taskItem);
        }

        checkbox.addEventListener('click', () => {
            checkbox.innerHTML = '';
            checkbox.appendChild(createCheckmark());
            taskItem.classList.add('completed');
            
            setTimeout(() => {
                archivedTasksList.appendChild(taskItem);
                saveTasks();
            }, 800);
        });

        deleteBtn.addEventListener('click', () => {
            taskItem.style.opacity = '0';
            setTimeout(() => {
                taskItem.remove();
                saveTasks();
            }, 200);
        });

        return taskItem;
    }

    // Load tasks when page loads
    loadTasks();

    // Add timer view toggle
    const timerCircle = document.querySelector('.timer-circle');
    const pomoView = document.getElementById('pomo-view');
    const container = document.querySelector('.container');

    timerCircle.addEventListener('click', () => {
        pomoView.classList.toggle('hidden');
        container.classList.toggle('hidden'); // Toggle tasks container visibility
    });

    // Close timer view when clicking outside
    pomoView.addEventListener('click', (e) => {
        if (e.target === pomoView) {
            pomoView.classList.add('hidden');
            container.classList.remove('hidden'); // Show tasks container
        }
    });

    // Music player functionality
    const playBtn = document.querySelector('.play-btn');
    const progress = document.querySelector('.progress');
    const coverArt = document.querySelector('.cover-art img');
    const coverTitle = document.querySelector('.cover-text h1');
    const coverSubtitle = document.querySelector('.cover-text p');
    const timeDisplay = document.querySelector('.time');
    const trackItems = document.querySelectorAll('.track-item');
    
    let isPlaying = false;
    let currentTimer = null;
    let timeLeft = 1500; // 25 minutes in seconds by default

    function updatePlayerDisplay(image, title, subtitle, duration) {
        coverArt.src = image;
        coverTitle.textContent = title;
        coverSubtitle.textContent = subtitle;
        timeLeft = parseInt(duration) * 60; // Convert minutes to seconds
        updateTimeDisplay();
        resetProgress();
    }

    function updateTimeDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function resetProgress() {
        progress.style.width = '0%';
        if (currentTimer) {
            clearInterval(currentTimer);
            currentTimer = null;
        }
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    trackItems.forEach(track => {
        track.addEventListener('click', () => {
            // Remove active class from all tracks
            trackItems.forEach(t => t.classList.remove('active-track'));
            // Add active class to clicked track
            track.classList.add('active-track');
            
            const image = track.querySelector('img').src;
            const title = track.querySelector('h3').textContent;
            const subtitle = track.querySelector('p').textContent;
            const duration = track.querySelector('.track-duration').textContent.split(':')[0];
            
            updatePlayerDisplay(image, title, subtitle, duration);
        });
    });

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        if (isPlaying) {
            currentTimer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimeDisplay();
                    // Calculate progress based on time remaining vs total time
                    const totalTime = parseInt(document.querySelector('.active-track .track-duration').textContent.split(':')[0]) * 60;
                    const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
                    progress.style.width = progressPercent + '%';
                } else {
                    resetProgress();
                }
            }, 1000);
        } else if (currentTimer) {
            clearInterval(currentTimer);
            currentTimer = null;
        }
    });
});
