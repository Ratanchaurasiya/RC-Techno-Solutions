// ==========================================================================
// RC TECHNO SOLUTIONS - OFFICIAL AI ASSISTANT (RC AI Assistant)
// Intelligent, fast, multi-turn assistant with PostgreSQL Backend Integration,
// Quick-Action triggers, and smart intent fallback.
// ==========================================================================

class RCTechChatbot {
    constructor() {
        this.history = [];
        this.isOpen = false;
        this.isInitialized = false;
        this.sessionId = localStorage.getItem('rc_chat_session_id') || ('rc_sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6));
        localStorage.setItem('rc_chat_session_id', this.sessionId);
        this.initUI();
    }

    initUI() {
        if (document.getElementById('rc-chat-widget')) return;

        const widgetHtml = `
            <div class="rc-chat-widget" id="rc-chat-widget">
                <!-- Floating Chat Button with Online Indicator -->
                <button class="rc-chat-toggle" id="rc-chat-toggle" aria-label="Open RC AI Assistant">
                    <i class="fas fa-robot"></i>
                    <span class="rc-chat-ping"></span>
                </button>

                <!-- Floating Chat Window -->
                <div class="rc-chat-window" id="rc-chat-window">
                    <div class="rc-chat-header">
                        <div class="rc-chat-header-info">
                            <div class="rc-chat-avatar"><i class="fas fa-brain"></i></div>
                            <div>
                                <h3 class="rc-chat-title">RC AI Assistant</h3>
                                <p class="rc-chat-subtitle"><span class="rc-status-dot"></span> Online &bull; Enterprise AI</p>
                            </div>
                        </div>
                        <div class="rc-chat-header-actions">
                            <button class="rc-chat-action-btn" id="rc-chat-clear" aria-label="Clear chat" title="New conversation">
                                <i class="fas fa-rotate-right"></i>
                            </button>
                            <button class="rc-chat-action-btn" id="rc-chat-minimize" aria-label="Minimize Chat" title="Minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="rc-chat-close" id="rc-chat-close" aria-label="Close Chat">&times;</button>
                        </div>
                    </div>

                    <!-- Chat Message Area -->
                    <div class="rc-chat-messages" id="rc-chat-messages">
                        <!-- Messages dynamically rendered -->
                    </div>

                    <!-- Quick Action Buttons -->
                    <div class="rc-chat-quick-replies" id="rc-quick-replies">
                        <button class="rc-qr-btn" data-query="Explore Our Services"><i class="fas fa-laptop-code"></i> Explore Our Services</button>
                        <button class="rc-qr-btn" data-query="View Our Projects"><i class="fas fa-cubes"></i> View Our Projects</button>
                        <button class="rc-qr-btn" data-query="Internship Opportunities"><i class="fas fa-graduation-cap"></i> Internship Opportunities</button>
                        <button class="rc-qr-btn" data-query="Request a Project Quote"><i class="fas fa-file-invoice-dollar"></i> Request a Project Quote</button>
                        <button class="rc-qr-btn" data-query="Contact Our Team"><i class="fas fa-envelope"></i> Contact Our Team</button>
                    </div>

                    <!-- Input Area -->
                    <div class="rc-chat-input-area">
                        <input type="text" class="rc-chat-input" id="rc-chat-input" placeholder="Ask a question..." autocomplete="off" />
                        <button class="rc-chat-send" id="rc-chat-send" aria-label="Send Message"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHtml);

        // Bind DOM elements
        this.widget = document.getElementById('rc-chat-widget');
        this.window = document.getElementById('rc-chat-window');
        this.messagesContainer = document.getElementById('rc-chat-messages');
        this.inputField = document.getElementById('rc-chat-input');
        this.sendBtn = document.getElementById('rc-chat-send');
        this.toggleBtn = document.getElementById('rc-chat-toggle');
        this.closeBtn = document.getElementById('rc-chat-close');
        this.minimizeBtn = document.getElementById('rc-chat-minimize');
        this.clearBtn = document.getElementById('rc-chat-clear');
        this.quickRepliesContainer = document.getElementById('rc-quick-replies');

        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener('click', () => this.toggleChat());
        }
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearConversation());
        }
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        // Quick action button triggers
        this.quickRepliesContainer.querySelectorAll('.rc-qr-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                this.inputField.value = query;
                this.handleSend();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('open');
            this.toggleBtn.classList.add('active');
            if (!this.isInitialized) {
                this.startConversation();
                this.isInitialized = true;
            }
            setTimeout(() => this.inputField.focus(), 300);
        } else {
            this.window.classList.remove('open');
            this.toggleBtn.classList.remove('active');
        }
    }

    clearConversation() {
        this.messagesContainer.innerHTML = '';
        this.sessionId = 'rc_sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        localStorage.setItem('rc_chat_session_id', this.sessionId);
        this.startConversation();
    }

    startConversation() {
        const welcome = "Hello! Welcome to **RC Techno Solutions**.\n\nI'm your **RC AI Assistant**. I can help you explore our software development services, technology solutions, projects, and internship opportunities.\n\nHow can I help you today?";
        this.addMessage(welcome, 'bot');
    }

    addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `rc-msg ${sender}`;

        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/• (.*?)(<br>|$)/g, '<li>$1</li>');

        if (formattedText.includes('<li>')) {
            formattedText = formattedText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        }

        // Format markdown links: [Text](URL)
        formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="rc-chat-link" style="color: #0084ff; font-weight: 700; text-decoration: underline;">$1</a>');

        msgDiv.innerHTML = formattedText;
        this.messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    showTyping() {
        this.hideTyping();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'rc-msg bot rc-typing';
        typingDiv.id = 'rc-typing-indicator';
        typingDiv.innerHTML = `
            <span class="rc-dot"></span>
            <span class="rc-dot"></span>
            <span class="rc-dot"></span>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const indicator = document.getElementById('rc-typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async handleSend() {
        const text = this.inputField.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.inputField.value = '';
        this.inputField.disabled = true;
        this.sendBtn.disabled = true;

        this.showTyping();

        try {
            // Send to Backend API with Server-Side AI Brain + PostgreSQL Sync
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    sender: 'user',
                    message: text,
                    generateAiReply: true
                })
            });

            const data = await response.json();
            this.hideTyping();

            let reply = data.reply;
            if (!reply) {
                reply = "I'm here to help with our custom software, cloud engineering, projects, or our 1-Month Internship Program. Please ask any specific question!";
            }

            this.addMessage(reply, 'bot');
        } catch (err) {
            this.hideTyping();
            const fallback = "I'm currently connected in standalone mode. You can explore our services at /services, our portfolio at /portfolio, or apply for our internship at /internship!";
            this.addMessage(fallback, 'bot');
        } finally {
            this.inputField.disabled = false;
            this.sendBtn.disabled = false;
            this.inputField.focus();
        }
    }
}

// Auto initialize on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.rcChatbot = new RCTechChatbot();
    });
} else {
    window.rcChatbot = new RCTechChatbot();
}
