document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const dueTimeInput = document.getElementById('due-time-input');
    const priorityInput = document.getElementById('priority-input');
    const categoryInput = document.getElementById('category-input');
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

        if (taskText === '') return;

        const task = {
            text: taskText,
            dueDate: dueDate,
            dueTime: dueTime,
            priority: priority,
            category: category,
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

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function showNotificationDelete(message) {
        const notification = document.createElement('div');
        notification.className = 'notificationDelete';
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function loadTasks() {
        let tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            const li = createTaskElement(task);
            if (task.completed) {
                li.classList.add('completed');
                li.querySelector('.checkbox').checked = true;
            }
            taskList.appendChild(li);
        });
    }

    loadTasks();
});
