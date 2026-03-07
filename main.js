document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const timeSlotsContainer = document.getElementById('time-slots');
    const datePicker = document.getElementById('date-picker');
    const prevDateBtn = document.getElementById('prev-date');
    const nextDateBtn = document.getElementById('next-date');

    // State management
    let currentSelectedDate = new Date();

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function updateDateDisplay() {
        datePicker.value = formatDate(currentSelectedDate);
        loadData();
    }

    // Initialize date
    updateDateDisplay();

    // Date navigation
    datePicker.addEventListener('change', (e) => {
        currentSelectedDate = new Date(e.target.value);
        updateDateDisplay();
    });

    prevDateBtn.addEventListener('click', () => {
        currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);
        updateDateDisplay();
    });

    nextDateBtn.addEventListener('click', () => {
        currentSelectedDate.setDate(currentSelectedDate.getDate() + 1);
        updateDateDisplay();
    });

    // Generate Time Slots (6 AM to 10 PM)
    const startTime = 6;
    const endTime = 22;

    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
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

        // Auto-save on input
        input.addEventListener('input', saveData);

        slot.appendChild(timeLabel);
        slot.appendChild(input);
        timeSlotsContainer.appendChild(slot);
    }

    renderTimeSlots();

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
    function getStorageKey() {
        return `musk-timebox-data-${formatDate(currentSelectedDate)}`;
    }

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
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
    }

    function loadData() {
        // Migration check: If no date-specific data but old common data exists, migrate it to today
        const storageKey = getStorageKey();
        let rawData = localStorage.getItem(storageKey);

        const oldKey = 'musk-timebox-data';
        const oldData = localStorage.getItem(oldKey);

        if (!rawData && oldData && formatDate(currentSelectedDate) === formatDate(new Date())) {
            rawData = oldData;
            localStorage.setItem(storageKey, oldData);
            localStorage.removeItem(oldKey); // Cleanup
            console.log('Migrated old data to today');
        }

        // Reset UI
        todoList.innerHTML = '';
        document.querySelectorAll('.priorities input').forEach(input => input.value = '');
        document.querySelectorAll('.slot-input').forEach(input => input.value = '');

        if (!rawData) return;

        const data = JSON.parse(rawData);

        // Load Todos
        if (data.todos) {
            data.todos.forEach(todo => {
                const text = typeof todo === 'string' ? todo : todo.text;
                const completed = typeof todo === 'string' ? false : todo.completed;
                const li = createTodoItem(text, completed);
                todoList.appendChild(li);
            });
        }

        // Load Priorities
        const priorityInputs = document.querySelectorAll('.priorities input');
        if (data.priorities) {
            data.priorities.forEach((val, i) => {
                if (priorityInputs[i]) priorityInputs[i].value = val;
            });
        }

        // Load Slots
        const slotInputs = document.querySelectorAll('.slot-input');
        slotInputs.forEach(input => {
            if (data.slots && data.slots[input.dataset.time]) {
                input.value = data.slots[input.dataset.time];
            }
        });
    }

    // Auto-save for priorities
    document.querySelector('.priorities').addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            saveData();
        }
    });

});
