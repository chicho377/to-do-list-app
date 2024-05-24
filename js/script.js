document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', manageTask);

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value;
        if (taskText === '') return;

        const li = document.createElement('li');
        li.appendChild(document.createTextNode(taskText));
        const deleteBtn = document.createElement('button');
        deleteBtn.appendChild(document.createTextNode('Eliminar'));
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        storeTaskInLocalStorage(taskText);
        taskInput.value = '';
    }

    function manageTask(e) {
        if (e.target.tagName === 'BUTTON') {
            const li = e.target.parentElement;
            taskList.removeChild(li);
            removeTaskFromLocalStorage(li);
        } else {
            e.target.classList.toggle('completed');
            toggleCompleteInLocalStorage(e.target);
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
        tasks = tasks.filter(task => task.text !== taskItem.textContent.replace('Eliminar', '').trim());
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function toggleCompleteInLocalStorage(taskItem) {
        let tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            if (task.text === taskItem.textContent.replace('Eliminar', '').trim()) {
                task.completed = !task.completed;
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        let tasks = getTasksFromLocalStorage();
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(task.text));
            const deleteBtn = document.createElement('button');
            deleteBtn.appendChild(document.createTextNode('Eliminar'));
            li.appendChild(deleteBtn);
            if (task.completed) {
                li.classList.add('completed');
            }
            taskList.appendChild(li);
        });
    }

    loadTasks();
});
