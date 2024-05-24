document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const notificationSound = new Audio('notification.mp3'); // Asegúrate de tener un archivo de sonido en tu proyecto

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        if (taskText === '') return;

        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" class="checkbox"> ${taskText} <button>Eliminar</button>`;
        taskList.appendChild(li);

        storeTaskInLocalStorage(taskText);
        taskInput.value = '';
    }

    function manageTask(e) {
        if (e.target.tagName === 'BUTTON') {
            const li = e.target.parentElement;
            taskList.removeChild(li);
            removeTaskFromLocalStorage(li);
        } else if (e.target.classList.contains('checkbox')) {
            const li = e.target.parentElement;
            li.classList.toggle('completed');
            if (li.classList.contains('completed')) {
                notificationSound.play();
                showNotification('Tarea completada');
                taskList.removeChild(li);
                removeTaskFromLocalStorage(li);
            }
        }
    }

    function storeTaskInLocalStorage(task) {
        let tasks = getTasksFromLocalStorage();
        tasks.push({ text: task, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function getTasksFromLocalStorage() {
        let tasks;
        if (localStorage.getItem('tasks') === null) {
            tasks = [];
        } else {
            tasks = JSON.parse(localStorage.getItem('tasks'));
        }
        return tasks;
    }

    function removeTaskFromLocalStorage(taskItem) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.filter(task => task.text !== taskItem.textContent.trim());
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function loadTasks() {
        let tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}> ${task.text} <button>Eliminar</button>`;
            if (task.completed) {
                li.classList.add('completed');
            }
            taskList.appendChild(li);
        });
    }

    loadTasks();
});
