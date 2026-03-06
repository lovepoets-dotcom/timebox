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

    for (let i = startTime; i <= endTime; i++) {
        createTimeSlot(i, "00");
        createTimeSlot(i, "30");
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
    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const li = document.createElement('li');
        li.textContent = text;
        
        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = '✕';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.color = '#ff453a';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
            saveData();
        };

        li.appendChild(deleteBtn);
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
            todos.push(li.firstChild.textContent);
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
        const data = JSON.parse(localStorage.getItem('musk-timebox-data'));
        if (!data) return;

        data.todos.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            const deleteBtn = document.createElement('span');
            deleteBtn.textContent = '✕';
            deleteBtn.style.color = '#ff453a';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                li.remove();
                saveData();
            };
            li.appendChild(deleteBtn);
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
        if (e.target.tagName === 'INPUT') {
            saveData();
        }
    });

    loadData();
});
