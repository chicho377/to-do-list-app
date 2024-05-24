document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const notificationSound = new Audio('notification.mp3'); 

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        if (taskText === '') return;

        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" class="checkbox"> ${taskText} <button>Eliminar</button>`;
        taskList.appendChild(li);

        storeTaskInLocalStorage({ text: taskText, completed: false });
        taskInput.value = '';
    }

    function manageTask(e) {
        if (e.target.tagName === 'BUTTON') {
            const li = e.target.parentElement;
            taskList.removeChild(li);
            removeTaskFromLocalStorage(li.firstChild.nextSibling.textContent.trim());
            notificationSound.play();
            showNotification('Tarea eliminada');
        } else if (e.target.classList.contains('checkbox')) {
            const li = e.target.parentElement;
            li.classList.toggle('completed');
            const taskText = li.firstChild.nextSibling.textContent.trim();
            if (li.classList.contains('completed')) {
                notificationSound.play();
                showNotification('Tarea completada');
                taskList.removeChild(li);
                removeTaskFromLocalStorage(taskText);
            } else {
                updateTaskInLocalStorage(taskText, false);
            }
        }
    }

    function storeTaskInLocalStorage(task) {
        let tasks = getTasksFromLocalStorage();
        tasks.push(task);
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

    function removeTaskFromLocalStorage(taskText) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.filter(task => task.text !== taskText);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTaskInLocalStorage(taskText, completed) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.map(task => {
            if (task.text === taskText) {
                task.completed = completed;
            }
            return task;
        });
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
            if (!task.completed) {  // Solo cargar tareas que no estén completadas
                const li = document.createElement('li');
                li.innerHTML = `<input type="checkbox" class="checkbox"> ${task.text} <button>Eliminar</button>`;
                taskList.appendChild(li);
            }
        });
    }

    loadTasks();
});
