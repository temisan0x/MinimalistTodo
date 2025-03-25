// DOM Elements
const todoList = document.getElementById('todo-list');
const filterAll = document.getElementById('all');
const filterCompleted = document.getElementById('completed');
const filterPending = document.getElementById('pending');
const prevPage = document.getElementById('prev');
const nextPage = document.getElementById('next');
const pageInfo = document.getElementById('page-info');

let todos = [];
let currentPage = 1;
const todosPerPage = 5;
let currentFilter = 'all';

// Load todos from localStorage or fetch from API if none exist
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
        renderTodos();
    } else {
        fetchTodos(); // Fallback to API if no localStorage data
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

async function fetchTodos() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const allTodos = await response.json();
        todos = allTodos.filter(todo => todo.userId === 1 && todo.id >= 1 && todo.id <= 5);
        saveTodos(); // Save the fetched todos to localStorage
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

function generateMockId() {
    return Math.max(...todos.map(todo => todo.id), 0) + 1;
}

document.getElementById('add-todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-todo');
    const title = input.value.trim();

    if (title) {
        const newTodo = {
            userId: 1,
            id: generateMockId(),
            title: title,
            completed: false
        };

        todos.unshift(newTodo);
        input.value = '';
        currentPage = 1;
        saveTodos(); // Save to localStorage after adding
        renderTodos();
    }
});

function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'pending') return !todo.completed;
        return true; // 'all'
    });

    const startIndex = (currentPage - 1) * todosPerPage;
    const paginatedTodos = filteredTodos.slice(startIndex, startIndex + todosPerPage);

    todoList.innerHTML = paginatedTodos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <span>${todo.title}</span>
      <button onclick="toggleComplete(${todo.id}, ${!todo.completed})">
        ${todo.completed ? '❌ Undo' : '✅ Complete'}
      </button>
    </li>
  `).join('');

    const totalPages = Math.ceil(filteredTodos.length / todosPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = filteredTodos.length <= todosPerPage || currentPage >= totalPages;
}

async function toggleComplete(id, completed) {
    try {
        const todo = todos.find(t => t.id === id);
        todo.completed = completed;
        saveTodos(); // Save to localStorage after toggling
        renderTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

filterAll.addEventListener('click', () => {
    currentFilter = 'all';
    currentPage = 1;
    renderTodos();
});

filterCompleted.addEventListener('click', () => {
    currentFilter = 'completed';
    currentPage = 1;
    renderTodos();
});

filterPending.addEventListener('click', () => {
    currentFilter = 'pending';
    currentPage = 1;
    renderTodos();
});

prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTodos();
    }
});

nextPage.addEventListener('click', () => {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'pending') return !todo.completed;
        return true;
    });
    const totalPages = Math.ceil(filteredTodos.length / todosPerPage);
    if (currentPage < totalPages && filteredTodos.length > todosPerPage) {
        currentPage++;
        renderTodos();
    }
});

// Initialize by loading todos
loadTodos();