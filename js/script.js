document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const priorityInput = document.getElementById('priority-input');
    const categoryInput = document.getElementById('category-input');
    const taskList = document.getElementById('task-list');
    const notificationSound = new Audio('/notifications/notification.mp3');
    const notificationSound2 = new Audio('/notifications/notificatioDelete.mp3'); 

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        const category = categoryInput.value;

        if (taskText === '') return;

        const task = {
            text: taskText,
            dueDate: dueDate,
            priority: priority,
            category: category,
            completed: false
        };

        const li = createTaskElement(task);
        taskList.appendChild(li);

        storeTaskInLocalStorage(task);
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
        categoryInput.value = '';
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" class="checkbox"> 
                <span class="task-text">${task.text}</span>
                ${task.dueDate ? `<span class="due-date">${task.dueDate}</span>` : ''}
                ${task.priority ? `<span class="priority">${task.priority}</span>` : ''}
                ${task.category ? `<span class="category">${task.category}</span>` : ''}
            </div>
            <div>
                <button class="edit">Editar</button>
                <button class="delete">Eliminar</button>
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
                notificationSound2.play();
                showNotification('Tarea eliminada');
            } else if (e.target.classList.contains('edit')) {
                editTask(li);
            }
        } else if (e.target.classList.contains('checkbox')) {
            li.classList.toggle('completed');
            const completed = li.classList.contains('completed');
            updateTaskInLocalStorage(taskText, { completed });
            if (completed) {
                notificationSound.play();
                showNotification('Tarea completada');
                setTimeout(() => taskList.removeChild(li), 1000);
            }
        }
    }

    function editTask(li) {
        const taskText = li.querySelector('.task-text').textContent.trim();
        const task = getTasksFromLocalStorage().find(t => t.text === taskText);

        taskInput.value = task.text;
        dueDateInput.value = task.dueDate;
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
