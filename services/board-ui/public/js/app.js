class TaskManager {
    constructor() {
        this.apiBase = window.location.origin;
        this.currentTaskId = null;
        this.pollingInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTasks();
        this.startPolling();
    }

    initializeElements() {
        this.dashboardView = document.getElementById('dashboardView');
        this.taskDetailView = document.getElementById('taskDetailView');
        
        this.createTaskModal = document.getElementById('createTaskModal');
        this.createTaskForm = document.getElementById('createTaskForm');
        
        this.createTaskBtn = document.getElementById('createTaskBtn');
        this.closeModal = document.getElementById('closeModal');
        this.cancelTask = document.getElementById('cancelTask');
        this.backToBoard = document.getElementById('backToBoard');
        
        this.pendingTasks = document.getElementById('pendingTasks');
        this.inProgressTasks = document.getElementById('inProgressTasks');
        this.completedTasks = document.getElementById('completedTasks');
        
        this.pendingCount = document.getElementById('pendingCount');
        this.inProgressCount = document.getElementById('inProgressCount');
        this.completedCount = document.getElementById('completedCount');
        
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskCreated = document.getElementById('taskCreated');
        this.taskUpdated = document.getElementById('taskUpdated');
        this.taskStatus = document.getElementById('taskStatus');
        this.todosList = document.getElementById('todosList');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        this.loadingIndicator = document.getElementById('loadingIndicator');
    }

    bindEvents() {
        this.createTaskBtn.addEventListener('click', () => this.showModal());
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.cancelTask.addEventListener('click', () => this.hideModal());
        this.createTaskForm.addEventListener('submit', (e) => this.handleCreateTask(e));
        
        this.backToBoard.addEventListener('click', () => this.showDashboard());
        
        this.taskStatus.addEventListener('change', (e) => this.updateTaskStatus(e.target.value));
        
        this.createTaskModal.addEventListener('click', (e) => {
            if (e.target === this.createTaskModal) {
                this.hideModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.createTaskModal.classList.contains('active')) {
                    this.hideModal();
                } else if (this.taskDetailView.classList.contains('active')) {
                    this.showDashboard();
                }
            }
        });
    }

    async makeRequest(endpoint, options = {}) {
        this.showLoading();
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            this.showError(error.message);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async loadTasks() {
        try {
            const tasks = await this.makeRequest('/tasks');
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    }

    renderTasks(tasks) {
        this.pendingTasks.innerHTML = '';
        this.inProgressTasks.innerHTML = '';
        this.completedTasks.innerHTML = '';

        const counts = { pending: 0, in_progress: 0, completed: 0 };

        tasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            
            switch (task.status) {
                case 'pending':
                    this.pendingTasks.appendChild(taskCard);
                    counts.pending++;
                    break;
                case 'in_progress':
                    this.inProgressTasks.appendChild(taskCard);
                    counts.in_progress++;
                    break;
                case 'completed':
                    this.completedTasks.appendChild(taskCard);
                    counts.completed++;
                    break;
            }
        });

        this.pendingCount.textContent = counts.pending;
        this.inProgressCount.textContent = counts.in_progress;
        this.completedCount.textContent = counts.completed;

        this.showEmptyStates();
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.addEventListener('click', () => this.showTaskDetail(task.id));

        const completedTodos = task.todos ? task.todos.filter(todo => todo.status === 'completed').length : 0;
        const totalTodos = task.todos ? task.todos.length : 0;
        const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

        card.innerHTML = `
            <div class="task-card-title">${this.escapeHtml(task.title)}</div>
            ${task.description ? `<div class="task-card-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-card-meta">
                <div class="task-progress">
                    <span>${completedTodos}/${totalTodos}</span>
                    <div class="progress-indicator">
                        <div class="fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="task-date">${this.formatDate(task.created_at)}</div>
            </div>
        `;

        return card;
    }

    showEmptyStates() {
        const columns = [
            { container: this.pendingTasks, message: 'No pending tasks' },
            { container: this.inProgressTasks, message: 'No tasks in progress' },
            { container: this.completedTasks, message: 'No completed tasks' }
        ];

        columns.forEach(({ container, message }) => {
            if (container.children.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📝</div>
                        <p>${message}</p>
                    </div>
                `;
            }
        });
    }

    async showTaskDetail(taskId) {
        try {
            const task = await this.makeRequest(`/tasks/${taskId}`);
            this.currentTaskId = taskId;
            this.renderTaskDetail(task);
            this.showTaskDetailView();
        } catch (error) {
            console.error('Failed to load task details:', error);
        }
    }

    renderTaskDetail(task) {
        this.taskTitle.textContent = task.title;
        this.taskDescription.textContent = task.description || 'No description provided';
        this.taskCreated.textContent = this.formatDate(task.created_at);
        this.taskUpdated.textContent = this.formatDate(task.updated_at);
        this.taskStatus.value = task.status;

        // Render todos
        this.renderTodos(task.todos || []);
    }

    renderTodos(todos) {
        this.todosList.innerHTML = '';

        if (todos.length === 0) {
            this.todosList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">✅</div>
                    <p>No tasks defined</p>
                </div>
            `;
            this.updateProgress(0, 0);
            return;
        }

        const completedCount = todos.filter(todo => todo.status === 'completed').length;

        todos.forEach(todo => {
            const todoItem = document.createElement('div');
            const isCompleted = todo.status === 'completed';
            todoItem.className = `todo-item ${isCompleted ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <div class="todo-checkbox ${isCompleted ? 'checked' : ''}" data-todo-id="${todo.id}">
                    ${isCompleted ? '✓' : ''}
                </div>
                <div class="todo-text">${this.escapeHtml(todo.content)}</div>
            `;

            // Add click handler for checkbox
            const checkbox = todoItem.querySelector('.todo-checkbox');
            if (!isCompleted) {
                checkbox.addEventListener('click', () => this.completeTodo(todo.id));
            }

            this.todosList.appendChild(todoItem);
        });

        this.updateProgress(completedCount, todos.length);
    }

    updateProgress(completed, total) {
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${completed} of ${total} completed`;
    }

    async completeTodo(todoId) {
        try {
            await this.makeRequest(`/tasks/${this.currentTaskId}/todos/${todoId}/complete`, {
                method: 'POST'
            });
            
            // Reload task details to show updated state
            await this.showTaskDetail(this.currentTaskId);
            
            await this.loadTasks();
        } catch (error) {
            console.error('Failed to complete todo:', error);
        }
    }

    async updateTaskStatus(newStatus) {
        try {
            await this.makeRequest(`/tasks/${this.currentTaskId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            
            await this.loadTasks();
            
            this.showSuccess('Task status updated');
        } catch (error) {
            console.error('Failed to update task status:', error);
            const task = await this.makeRequest(`/tasks/${this.currentTaskId}`);
            this.taskStatus.value = task.status;
        }
    }

    async handleCreateTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitleInput').value.trim();
        const description = document.getElementById('taskDescriptionInput').value.trim();
        const todosText = document.getElementById('todosInput').value.trim();
        
        if (!title) {
            this.showError('Title is required');
            return;
        }

        const todos = todosText ? 
            todosText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(content => ({ content })) : [];

        try {
            await this.makeRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify({ title, description, todos })
            });

            this.hideModal();
            this.createTaskForm.reset();
            await this.loadTasks();
            this.showSuccess('Task created successfully');
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    }

    showModal() {
        this.createTaskModal.classList.add('active');
        document.getElementById('taskTitleInput').focus();
    }

    hideModal() {
        this.createTaskModal.classList.remove('active');
    }

    showDashboard() {
        this.dashboardView.classList.add('active');
        this.taskDetailView.classList.remove('active');
        this.currentTaskId = null;
    }

    showTaskDetailView() {
        this.dashboardView.classList.remove('active');
        this.taskDetailView.classList.add('active');
    }

    showLoading() {
        this.loadingIndicator.classList.add('active');
    }

    hideLoading() {
        this.loadingIndicator.classList.remove('active');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '3000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px'
        });

        // Set background color based on type
        switch (type) {
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startPolling() {
        this.pollingInterval = setInterval(() => {
            if (this.dashboardView.classList.contains('active')) {
                this.loadTasks();
            } else if (this.currentTaskId) {
                this.showTaskDetail(this.currentTaskId);
            }
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Handle page visibility changes for polling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.taskManager?.stopPolling();
    } else {
        window.taskManager?.startPolling();
    }
});