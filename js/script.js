document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const dueTimeInput = document.getElementById('due-time-input');
    const priorityInput = document.getElementById('priority-input');
    const categoryInput = document.getElementById('category-input');
    const subtaskInput = document.getElementById('subtask-input');
    const taskList = document.getElementById('task-list');
    const notificationComplete = new Audio('/notifications/notification.mp3');
    const notificationDelete = new Audio('/notifications/notificatioDelete.mp3');
    const notificationAdd = new Audio('/notifications/addTask.mp3');

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        const dueDate = dueDateInput.value;
        const dueTime = dueTimeInput.value;
        const priority = priorityInput.value;
        const category = categoryInput.value;
        const subtaskText = subtaskInput.value;

        if (taskText === '') return;

        const subtasks = subtaskText.split(',').map(subtask => subtask.trim()).filter(subtask => subtask !== '');

        const task = {
            text: taskText,
            dueDate: dueDate,
            dueTime: dueTime,
            priority: priority,
            category: category,
            subtasks: subtasks.map(subtask => ({ text: subtask, completed: false })),
            completed: false
        };

        const li = createTaskElement(task);
        taskList.appendChild(li);

        storeTaskInLocalStorage(task);
        taskInput.value = '';
        dueDateInput.value = '';
        dueTimeInput.value = '';
        priorityInput.value = 'Baja';
        categoryInput.value = '';
        subtaskInput.value = '';
    }

    function createTaskElement(task) {
        notificationAdd.play();
        const li = document.createElement('li');
        li.className = `${task.priority} collapsed`;
        li.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="checkbox"> 
                <span class="task-text">${task.text}</span>
                <button class="expand">🔽</button>
            </div>
            <div class="task-details">
                ${task.dueDate ? `<span class="due-date">Fecha: ${task.dueDate}</span>` : ''}
                ${task.dueTime ? `<span class="due-time">Hora: ${task.dueTime}</span>` : ''}
                ${task.priority ? `<span class="priority">Prioridad: ${task.priority}</span>` : ''}
                ${task.category ? `<span class="category">Categoría: ${task.category}</span>` : ''}
                ${task.subtasks.length > 0 ? `<ul class="subtask-list">${task.subtasks.map(subtask => `
                    <li class="subtask">
                        <input type="checkbox" class="subtask-checkbox">
                        <span class="subtask-text">${subtask.text}</span>
                    </li>
                `).join('')}</ul>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑️</button>
            </div>
        `;
        return li;
    }

    function manageTask(e) {
        const li = e.target.closest('li');
        const taskText = li.querySelector('.task-text').textContent.trim();

        if (e.target.tagName === 'BUTTON') {
            if (e.target.classList.contains('delete')) {
                taskList.removeChild(li);
                removeTaskFromLocalStorage(taskText);
                notificationDelete.play();
                showNotificationDelete('Tarea eliminada');
            } else if (e.target.classList.contains('edit')) {
                editTask(li);
            } else if (e.target.classList.contains('expand')) {
                li.classList.toggle('collapsed');
                e.target.textContent = li.classList.contains('collapsed') ? '🔽' : '🔼';
            }
        } else if (e.target.classList.contains('checkbox')) {
            li.classList.toggle('completed');
            const completed = li.classList.contains('completed');
            updateTaskInLocalStorage(taskText, { completed });
            if (completed) {
                notificationComplete.play();
                showNotification('Tarea completada');
                setTimeout(() => taskList.removeChild(li), 1000);
                removeTaskFromLocalStorage(taskText);
            }
        } else if (e.target.classList.contains('subtask-checkbox')) {
            const subtaskLi = e.target.closest('.subtask');
            subtaskLi.classList.toggle('completed');
            const subtaskText = subtaskLi.querySelector('.subtask-text').textContent.trim();
            updateSubtaskInLocalStorage(taskText, subtaskText, subtaskLi.classList.contains('completed'));
        }
    }

    function editTask(li) {
        const taskText = li.querySelector('.task-text').textContent.trim();
        const task = getTasksFromLocalStorage().find(t => t.text === taskText);

        taskInput.value = task.text;
        dueDateInput.value = task.dueDate;
        dueTimeInput.value = task.dueTime;
        priorityInput.value = task.priority;
        categoryInput.value = task.category;
        subtaskInput.value = task.subtasks.map(subtask => subtask.text).join(', ');

        taskList.removeChild(li);
        removeTaskFromLocalStorage(taskText);
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

    function updateTaskInLocalStorage(taskText, updates) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.map(task => {
            if (task.text === taskText) {
                return { ...task, ...updates };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateSubtaskInLocalStorage(taskText, subtaskText, completed) {
        let tasks = getTasksFromLocalStorage();
        tasks = tasks.map(task => {
            if (task.text === taskText) {
                task.subtasks = task.subtasks.map(subtask => {
                    if (subtask.text === subtaskText) {
                        return { ...subtask, completed };
                    }
                    return subtask;
                });
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    function showNotificationDelete(message) {
        const notification = document.createElement('div');
        notification.className = 'notification-delete';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    function loadTasks() {
        const tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            const li = createTaskElement(task);
            if (task.completed) {
                li.classList.add('completed');
            }
            taskList.appendChild(li);
        });
    }

    loadTasks();
});
