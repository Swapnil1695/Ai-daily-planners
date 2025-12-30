// DailyWork AI - AI Service Integration

class AIService {
    constructor() {
        this.providers = {
            huggingface: {
                name: 'Hugging Face',
                url: 'https://api-inference.huggingface.co/models/gpt2',
                key: null,
                enabled: false
            },
            gemini: {
                name: 'Google Gemini',
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                key: null,
                enabled: false
            },
            cohere: {
                name: 'Cohere',
                url: 'https://api.cohere.ai/v1/generate',
                key: null,
                enabled: false
            }
        };
        
        this.context = {
            userGoals: [],
            workPatterns: [],
            productivityLevels: {},
            recentTasks: []
        };
        
        this.cache = new Map();
        this.init();
    }
    
    init() {
        // Load AI providers from config
        this.loadProviders();
        // Load user context from localStorage
        this.loadContext();
    }
    
    loadProviders() {
        // Try to get API keys from localStorage
        try {
            const saved = localStorage.getItem('ai_providers');
            if (saved) {
                const providers = JSON.parse(saved);
                Object.assign(this.providers, providers);
            }
        } catch (error) {
            console.warn('Failed to load AI providers:', error);
        }
        
        // Check which providers are available
        this.checkProviderAvailability();
    }
    
    checkProviderAvailability() {
        // Check for API keys in environment or localStorage
        const hfKey = localStorage.getItem('hf_api_key') || process.env.HUGGINGFACE_API_KEY;
        const geminiKey = localStorage.getItem('gemini_api_key') || process.env.GEMINI_API_KEY;
        const cohereKey = localStorage.getItem('cohere_api_key') || process.env.COHERE_API_KEY;
        
        if (hfKey) {
            this.providers.huggingface.key = hfKey;
            this.providers.huggingface.enabled = true;
        }
        
        if (geminiKey) {
            this.providers.gemini.key = geminiKey;
            this.providers.gemini.enabled = true;
        }
        
        if (cohereKey) {
            this.providers.cohere.key = cohereKey;
            this.providers.cohere.enabled = true;
        }
    }
    
    async getAIResponse(prompt, context = {}, useMock = true) {
        // Check cache first
        const cacheKey = this.generateCacheKey(prompt, context);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Try providers in order
        for (const [name, provider] of Object.entries(this.providers)) {
            if (provider.enabled && provider.key) {
                try {
                    const response = await this.queryProvider(name, prompt, context);
                    if (response && response.trim()) {
                        this.cache.set(cacheKey, response);
                        return response;
                    }
                } catch (error) {
                    console.warn(`${name} provider failed:`, error.message);
                }
            }
        }
        
        // Fallback to mock AI
        if (useMock) {
            const mockResponse = this.getMockResponse(prompt, context);
            this.cache.set(cacheKey, mockResponse);
            return mockResponse;
        }
        
        return 'I apologize, but the AI service is currently unavailable. Please try again later.';
    }
    
    async queryProvider(providerName, prompt, context) {
        switch (providerName) {
            case 'huggingface':
                return this.queryHuggingFace(prompt, context);
            case 'gemini':
                return this.queryGemini(prompt, context);
            case 'cohere':
                return this.queryCohere(prompt, context);
            default:
                return null;
        }
    }
    
    async queryHuggingFace(prompt, context) {
        try {
            const response = await fetch(this.providers.huggingface.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.providers.huggingface.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: this.formatPrompt(prompt, context),
                    parameters: {
                        max_length: 500,
                        temperature: 0.7,
                        top_p: 0.9
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data[0]?.generated_text || '';
        } catch (error) {
            console.error('Hugging Face API error:', error);
            throw error;
        }
    }
    
    async queryGemini(prompt, context) {
        try {
            const response = await fetch(
                `${this.providers.gemini.url}?key=${this.providers.gemini.key}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: this.formatPrompt(prompt, context) }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 500
                        }
                    })
                }
            );
            
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }
    
    async queryCohere(prompt, context) {
        try {
            const response = await fetch(this.providers.cohere.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.providers.cohere.key}`,
                    'Content-Type': 'application/json',
                    'Cohere-Version': '2022-12-06'
                },
                body: JSON.stringify({
                    model: 'command',
                    prompt: this.formatPrompt(prompt, context),
                    max_tokens: 500,
                    temperature: 0.7,
                    k: 0,
                    p: 0.75
                })
            });
            
            const data = await response.json();
            return data.generations?.[0]?.text || '';
        } catch (error) {
            console.error('Cohere API error:', error);
            throw error;
        }
    }
    
    formatPrompt(prompt, context) {
        const systemPrompt = `You are an AI productivity assistant for DailyWork AI. Help users with task management, scheduling, focus techniques, and productivity improvement.

Context:
- User goals: ${context.goals || 'Not specified'}
- Current time: ${new Date().toLocaleTimeString()}
- Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
- Productivity level: ${context.productivity || 'Medium'}

User's message: ${prompt}

Provide a helpful, actionable response. Keep it concise but thorough. Include specific suggestions when appropriate.`;
        
        return systemPrompt;
    }
    
    getMockResponse(prompt, context) {
        const promptLower = prompt.toLowerCase();
        
        // Task-related responses
        if (promptLower.includes('task') || promptLower.includes('break down')) {
            return this.getTaskBreakdownResponse(prompt, context);
        }
        
        // Schedule-related responses
        if (promptLower.includes('schedule') || promptLower.includes('plan') || promptLower.includes('calendar')) {
            return this.getScheduleResponse(prompt, context);
        }
        
        // Focus-related responses
        if (promptLower.includes('focus') || promptLower.includes('concentrate') || promptLower.includes('distract')) {
            return this.getFocusResponse(prompt, context);
        }
        
        // Habit-related responses
        if (promptLower.includes('habit') || promptLower.includes('routine') || promptLower.includes('streak')) {
            return this.getHabitResponse(prompt, context);
        }
        
        // Analytics-related responses
        if (promptLower.includes('analytics') || promptLower.includes('productivity') || promptLower.includes('stats')) {
            return this.getAnalyticsResponse(prompt, context);
        }
        
        // General productivity advice
        return this.getGeneralResponse(prompt, context);
    }
    
    getTaskBreakdownResponse(prompt, context) {
        const responses = [
            `Based on your task, here's a breakdown:\n\n1. **Research Phase (45 minutes)**\n   - Gather requirements and materials\n   - Review existing documentation\n\n2. **Planning Phase (30 minutes)**\n   - Create outline and structure\n   - Set milestones and checkpoints\n\n3. **Execution Phase (90 minutes)**\n   - Work in focused 25-minute blocks\n   - Take 5-minute breaks between blocks\n\n4. **Review Phase (30 minutes)**\n   - Quality check and revisions\n   - Final polish and formatting\n\nPro tip: Start with the most challenging part first when your energy is highest.`,
            
            `I recommend breaking this task into manageable chunks:\n\n• **Chunk 1: Foundation (60 min)**\n  Establish the basic structure and requirements\n\n• **Chunk 2: Core Development (120 min)**\n  Build the main components with focused sessions\n\n• **Chunk 3: Refinement (45 min)**\n  Review, test, and improve\n\n• **Chunk 4: Completion (30 min)**\n  Final checks and delivery\n\nConsider using the Pomodoro technique (25 minutes work, 5 minutes rest) for maximum focus.`,
            
            `Here's an efficient breakdown strategy:\n\n**Phase 1: Preparation (Today)**\n- Define clear objectives (15 min)\n- Gather resources (30 min)\n\n**Phase 2: Execution (Tomorrow AM)**\n- Deep work session 1 (90 min)\n- Break & review (15 min)\n- Deep work session 2 (60 min)\n\n**Phase 3: Polish (Tomorrow PM)**\n- Final revisions (45 min)\n- Quality assurance (30 min)\n\nSchedule the most demanding work during your peak energy hours (usually 9-11 AM).`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getScheduleResponse(prompt, context) {
        const responses = [
            `**Optimal Schedule Suggestion:**\n\n🕘 9:00-10:30 → Deep Focus Work\n   *Most important task of the day*\n\n🕥 10:30-11:00 → Short Break\n   *Stretch, hydrate, rest eyes*\n\n🕚 11:00-12:30 → Creative Tasks\n   *Brainstorming, planning, strategy*\n\n🕧 12:30-13:30 → Lunch Break\n   *Proper nutrition and mental reset*\n\n🕜 13:30-15:00 → Meetings/Collaboration\n   *Team syncs, client calls*\n\n🕒 15:00-16:30 → Focus Session\n   *Second important task*\n\n🕟 16:30-17:00 → Planning & Wrap-up\n   *Review progress, plan tomorrow*`,
            
            `**Smart Scheduling Tips:**\n\n1. **Time Block Your Day**\n   Group similar tasks together\n   Example: All meetings in the afternoon\n\n2. **Energy Awareness**\n   Schedule complex tasks during peak energy (usually morning)\n   Save routine tasks for energy dips\n\n3. **Buffer Time**\n   Add 15-minute buffers between tasks\n   Prevents schedule overflow\n\n4. **Focus First**\n   Tackle your most important task before 11 AM\n   Avoid checking email first thing\n\n5. **Strategic Breaks**\n   Take 5-minute breaks every 90 minutes\n   Longer breaks after intensive sessions`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getFocusResponse(prompt, context) {
        const responses = [
            `**Focus Enhancement Strategies:**\n\n🎯 **Pomodoro Technique**\n   • 25 minutes focused work\n   • 5 minutes break\n   • Repeat 4 times\n   • Then take 15-30 minute break\n\n🧠 **Mindfulness Tips**\n   • Start with 1-minute deep breathing\n   • Clear workspace distractions\n   • Use website blockers if needed\n   • Listen to focus music (lofi, ambient)\n\n⏰ **Energy Management**\n   • Work during natural energy peaks\n   • Take movement breaks every hour\n   • Stay hydrated (water > coffee)\n   • Natural light improves focus`,
            
            `**Distraction Blocking Plan:**\n\n1. **Digital Cleanse (5 min)**\n   - Close unnecessary tabs\n   - Turn off non-essential notifications\n   - Use full-screen mode\n\n2. **Environment Setup (3 min)**\n   - Clear physical workspace\n   - Adjust lighting\n   - Get water/tea ready\n\n3. **Focus Ritual (2 min)**\n   - Deep breaths: 4-7-8 technique\n   - Set clear intention\n   - Start timer\n\n4. **Maintenance**\n   - If distracted, note it and return\n   - Use "do not disturb" mode\n   - Batch similar tasks`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getHabitResponse(prompt, context) {
        const responses = [
            `**Habit Formation Framework:**\n\n1. **Start Small**\n   • Begin with 2-minute version of habit\n   • Example: "Read 1 page" not "Read 1 hour"\n\n2. **Stack Habits**\n   • Attach new habit to existing routine\n   • Example: "After brushing teeth, I will plan my day"\n\n3. **Environment Design**\n   • Make good habits easy\n   • Make bad habits hard\n   • Example: Keep water bottle on desk\n\n4. **Track Progress**\n   • Use habit tracker\n   • Celebrate small wins\n   • Don't break the chain\n\n5. **Accountability**\n   • Share goals with someone\n   • Join DailyWork AI challenges\n   • Use streak tracking`,
            
            `**Recommended Productivity Habits:**\n\n🌅 **Morning Routine (15 min)**\n   • Review goals\n   • Plan top 3 tasks\n   • Mindfulness practice\n\n💻 **Work Rituals**\n   • Time blocking\n   • Email batching (2x daily)\n   • Pomodoro sessions\n\n🌙 **Evening Wind-down**\n   • Daily review\n   • Plan tomorrow\n   • Gratitude journal\n\n📈 **Weekly Habits**\n   • Sunday planning session\n   • Weekly review\n   • Learning time (2 hours)`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getAnalyticsResponse(prompt, context) {
        const responses = [
            `**Productivity Analysis:**\n\n📊 **Current Patterns**\n• Peak productivity: 9-11 AM\n• Focus duration: 45 minutes average\n• Break effectiveness: Good\n• Task completion rate: 75%\n\n🎯 **Improvement Areas**\n1. Reduce context switching\n2. Schedule breaks more strategically\n3. Batch similar tasks\n4. Improve evening planning\n\n🚀 **Recommendations**\n• Use time blocking for deep work\n• Implement "theme days"\n• Track energy levels\n• Review analytics weekly`,
            
            `**Performance Insights:**\n\n✅ **Strengths**\n• Consistent morning routine\n• Good task prioritization\n• Effective break timing\n\n📈 **Opportunities**\n• Evening productivity can improve\n• Meetings could be more efficient\n• Learning time allocation\n\n🔧 **Action Plan**\n1. Optimize meeting schedules\n2. Add focused learning blocks\n3. Improve task estimation\n4. Enhance collaboration time`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    getGeneralResponse(prompt, context) {
        const responses = [
            `As your AI productivity assistant, I recommend focusing on these key principles:\n\n1. **Prioritize Ruthlessly** - Work on what matters most, not what's most urgent\n2. **Single-Tasking** - Focus on one task at a time for better quality and speed\n3. **Energy Management** - Schedule tasks according to your natural energy rhythms\n4. **Strategic Rest** - Take breaks before you need them to maintain peak performance\n5. **Continuous Review** - Regularly assess what's working and adjust accordingly\n\nWhat specific area would you like to improve today?`,
            
            `Here are some evidence-based productivity tips:\n\n• **The Two-Minute Rule**: If a task takes less than 2 minutes, do it immediately\n• **Time Blocking**: Schedule specific times for specific tasks in your calendar\n• **The 80/20 Rule**: 80% of results come from 20% of efforts - identify and focus on that 20%\n• **Eisenhower Matrix**: Categorize tasks by urgency and importance\n• **Batch Processing**: Group similar tasks together to reduce context switching\n\nWhich technique would you like to implement?`,
            
            `Based on productivity research, here's what works best:\n\n🧠 **For Focus**:\n- Work in 90-minute ultradian cycles\n- Take 20-minute breaks between cycles\n- Use noise-cancelling headphones\n\n📅 **For Planning**:\n- Plan your day the night before\n- Set 3 Most Important Tasks (MITs)\n- Use weekly reviews for alignment\n\n⚡ **For Energy**:\n- Move every 60 minutes\n- Stay hydrated\n- Optimize lighting (natural light preferred)\n\nHow can I help you apply these today?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateCacheKey(prompt, context) {
        return `${prompt.slice(0, 100)}_${JSON.stringify(context).slice(0, 100)}`;
    }
    
    loadContext() {
        try {
            const saved = localStorage.getItem('ai_context');
            if (saved) {
                this.context = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load AI context:', error);
        }
    }
    
    saveContext() {
        try {
            localStorage.setItem('ai_context', JSON.stringify(this.context));
        } catch (error) {
            console.warn('Failed to save AI context:', error);
        }
    }
    
    updateContext(update) {
        Object.assign(this.context, update);
        this.saveContext();
    }
    
    // Specialized AI functions
    async analyzeTaskComplexity(taskDescription) {
        const prompt = `Analyze the complexity of this task and estimate time required: "${taskDescription}"`;
        return this.getAIResponse(prompt);
    }
    
    async suggestScheduleOptimization(currentSchedule) {
        const prompt = `Optimize this schedule for maximum productivity:\n${JSON.stringify(currentSchedule, null, 2)}`;
        return this.getAIResponse(prompt);
    }
    
    async generateFocusTechniques() {
        const prompt = "Suggest 5 specific focus techniques I can try today";
        return this.getAIResponse(prompt);
    }
    
    async recommendHabitsBasedOnGoals(goals) {
        const prompt = `Based on these goals: ${goals.join(', ')}, recommend 3 daily habits that will help achieve them`;
        return this.getAIResponse(prompt);
    }
    
    async analyzeProductivityPatterns(data) {
        const prompt = `Analyze these productivity patterns and suggest improvements:\n${JSON.stringify(data, null, 2)}`;
        return this.getAIResponse(prompt);
    }
}

// Export singleton instance
const aiService = new AIService();
window.aiService = aiService;

// Helper function for quick AI queries
async function askAI(prompt, context = {}) {
    return aiService.getAIResponse(prompt, context);
}

// Initialize AI service on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Service initialized');
    
    // Check if user wants to configure AI
    const aiConfigured = localStorage.getItem('ai_configured');
    if (!aiConfigured) {
        showAIConfigurationPrompt();
    }
});

function showAIConfigurationPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-robot"></i> Configure AI Assistant</h3>
            </div>
            <div class="modal-body">
                <p>For the best experience, you can connect your own AI API keys. This is optional - we provide free AI responses by default.</p>
                
                <div class="ai-providers-config">
                    <div class="provider">
                        <h4><i class="fab fa-google"></i> Google Gemini</h4>
                        <p>Free $300 credit available</p>
                        <input type="text" placeholder="API Key" id="geminiKey">
                    </div>
                    
                    <div class="provider">
                        <h4><i class="fas fa-brain"></i> Hugging Face</h4>
                        <p>Free inference API (rate limited)</p>
                        <input type="text" placeholder="API Key" id="huggingfaceKey">
                    </div>
                    
                    <div class="provider">
                        <h4><i class="fas fa-code"></i> Cohere</h4>
                        <p>Free trial available</p>
                        <input type="text" placeholder="API Key" id="cohereKey">
                    </div>
                </div>
                
                <p class="note"><i class="fas fa-info-circle"></i> You can add keys later in Settings > AI Configuration</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="skipAI">Skip for Now</button>
                <button class="btn btn-primary" id="saveAI">Save Configuration</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .ai-providers-config {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .provider {
            padding: 1rem;
            background: var(--gray-50);
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-200);
        }
        
        .provider h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .provider p {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.75rem;
        }
        
        .provider input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-md);
            font-family: monospace;
            font-size: 0.875rem;
        }
        
        .note {
            font-size: 0.875rem;
            color: var(--gray-600);
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
        }
    `;
    document.head.appendChild(style);
    
    // Event handlers
    document.getElementById('skipAI').addEventListener('click', function() {
        localStorage.setItem('ai_configured', 'skipped');
        modal.remove();
    });
    
    document.getElementById('saveAI').addEventListener('click', function() {
        const geminiKey = document.getElementById('geminiKey').value;
        const huggingfaceKey = document.getElementById('huggingfaceKey').value;
        const cohereKey = document.getElementById('cohereKey').value;
        
        if (geminiKey) {
            localStorage.setItem('gemini_api_key', geminiKey);
            aiService.providers.gemini.key = geminiKey;
            aiService.providers.gemini.enabled = true;
        }
        
        if (huggingfaceKey) {
            localStorage.setItem('hf_api_key', huggingfaceKey);
            aiService.providers.huggingface.key = huggingfaceKey;
            aiService.providers.huggingface.enabled = true;
        }
        
        if (cohereKey) {
            localStorage.setItem('cohere_api_key', cohereKey);
            aiService.providers.cohere.key = cohereKey;
            aiService.providers.cohere.enabled = true;
        }
        
        localStorage.setItem('ai_configured', 'configured');
        modal.remove();
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = '<i class="fas fa-check-circle"></i><span>AI configuration saved successfully!</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    });
}