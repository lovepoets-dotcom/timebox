document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const timeSlotsContainer = document.getElementById('time-slots');
    const currentDateEl = document.getElementById('current-date');

    // Set Current Date
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    // Generate Time Slots (6 AM to 10 PM)
    const startTime = 6;
    const endTime = 22;

    if (timeSlotsContainer.children.length === 0) {
        for (let i = startTime; i <= endTime; i++) {
            createTimeSlot(i, "00");
            createTimeSlot(i, "30");
        }
    }

    function createTimeSlot(hour, minute) {
        const slot = document.createElement('div');
        slot.className = 'slot';

        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeLabel.textContent = `${displayHour}:${minute} ${ampm}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'slot-input';
        input.placeholder = '—';
        input.dataset.time = `${hour}:${minute}`;

        slot.appendChild(timeLabel);
        slot.appendChild(input);
        timeSlotsContainer.appendChild(slot);
    }

    // Add Todo Functionality
    function createTodoItem(text, completed = false) {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = completed;
        checkbox.onchange = () => {
            li.classList.toggle('completed', checkbox.checked);
            saveData();
        };

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = text;

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
            saveData();
        };

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        return li;
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const li = createTodoItem(text);
        todoList.appendChild(li);
        todoInput.value = '';
        saveData();
    }

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Save/Load Logic
    function saveData() {
        const todos = [];
        document.querySelectorAll('#todo-list li').forEach(li => {
            todos.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.querySelector('.task-checkbox').checked
            });
        });

        const priorities = [];
        document.querySelectorAll('.priorities input').forEach(input => {
            priorities.push(input.value);
        });

        const slots = {};
        document.querySelectorAll('.slot-input').forEach(input => {
            slots[input.dataset.time] = input.value;
        });

        const data = { todos, priorities, slots };
        localStorage.setItem('musk-timebox-data', JSON.stringify(data));
    }

    function loadData() {
        const rawData = localStorage.getItem('musk-timebox-data');
        if (!rawData) return;

        const data = JSON.parse(rawData);

        todoList.innerHTML = '';
        data.todos.forEach(todo => {
            // Check if todo is object (new format) or string (old format)
            const text = typeof todo === 'string' ? todo : todo.text;
            const completed = typeof todo === 'string' ? false : todo.completed;
            const li = createTodoItem(text, completed);
            todoList.appendChild(li);
        });

        const priorityInputs = document.querySelectorAll('.priorities input');
        data.priorities.forEach((val, i) => {
            if (priorityInputs[i]) priorityInputs[i].value = val;
        });

        const slotInputs = document.querySelectorAll('.slot-input');
        slotInputs.forEach(input => {
            if (data.slots[input.dataset.time]) {
                input.value = data.slots[input.dataset.time];
            }
        });
    }

    // Auto-save on input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('slot-input') || e.target.parentElement.classList.contains('priorities')) {
            saveData();
        }
    });

    loadData();
});
