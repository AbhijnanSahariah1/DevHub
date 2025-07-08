const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 contact form submissions per hour
    message: {
        error: 'Too many contact form submissions, please try again later.',
        code: 'CONTACT_RATE_LIMIT_EXCEEDED'
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 API requests per windowMs
    message: {
        error: 'Too many API requests, please try again later.',
        code: 'API_RATE_LIMIT_EXCEEDED'
    }
});

app.use(generalLimiter);
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com', 'https://www.yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// ============================================================================
// DATA STORAGE (In-memory for demo - use database in production)
// ============================================================================

// Analytics data
let analytics = {
    pageViews: 0,
    uniqueVisitors: new Set(),
    contactFormSubmissions: 0,
    projectViews: {},
    skillViews: {},
    dailyStats: {},
    browserStats: {},
    countryStats: {},
    deviceStats: {},
    referrerStats: {}
};

// Projects data
const projects = [
    {
        id: 1,
        title: "GameHub Pro",
        description: "A comprehensive multi-game platform featuring four classic games with modern twists. Includes AI-powered Tic Tac Toe, Memory Game, Flappy Bird, and Snake - all built with vanilla JavaScript and featuring stunning animations.",
        technologies: ["HTML5", "CSS3", "JavaScript", "Canvas API", "AI Algorithms"],
        features: ["AI-powered gameplay", "Fully responsive", "Score tracking", "Multiple games", "Real-time animations"],
        status: "Live",
        demoUrl: "mult game.html",
        githubUrl: "https://github.com/Abhijnan1/gamehub-pro",
        imageUrl: "/images/gamehub-preview.jpg",
        category: "Game Development",
        featured: true,
        createdAt: "2024-12-01",
        views: 0,
        likes: 0,
        difficulty: "Advanced",
        completionTime: "3 months"
    },
    {
        id: 2,
        title: "Portfolio Website",
        description: "A modern, responsive portfolio website showcasing advanced CSS animations, 3D effects, and interactive elements. Features smooth scrolling, particle systems, and a beautiful glassmorphism design.",
        technologies: ["HTML5", "CSS3", "JavaScript", "Node.js", "Express"],
        features: ["Advanced animations", "3D effects", "Modern design", "Responsive layout", "Backend integration"],
        status: "Live",
        demoUrl: "index.html",
        githubUrl: "https://github.com/Abhijnan1/portfolio",
        imageUrl: "/images/portfolio-preview.jpg",
        category: "Web Development",
        featured: false,
        createdAt: "2024-11-15",
        views: 0,
        likes: 0,
        difficulty: "Intermediate",
        completionTime: "2 months"
    },
    {
        id: 3,
        title: "Smart Calculator",
        description: "An intelligent calculator with advanced mathematical functions, history tracking, and beautiful animations. Supports complex calculations, keyboard input, and features a sleek modern interface.",
        technologies: ["HTML5", "CSS3", "JavaScript", "Math.js"],
        features: ["Keyboard support", "Calculation history", "Smart functions", "Modern UI", "Error handling"],
        status: "Live",
        demoUrl: "calculator.html",
        githubUrl: "https://github.com/Abhijnan1/smart-calculator",
        imageUrl: "/images/calculator-preview.jpg",
        category: "Utility",
        featured: false,
        createdAt: "2024-10-20",
        views: 0,
        likes: 0,
        difficulty: "Beginner",
        completionTime: "1 month"
    },
    {
        id: 4,
        title: "AI Chat Assistant",
        description: "An intelligent chatbot powered by natural language processing. Features conversation memory, context awareness, and personality customization.",
        technologies: ["Python", "TensorFlow", "JavaScript", "WebSocket", "NLP"],
        features: ["Natural language processing", "Context awareness", "Real-time chat", "Personality modes"],
        status: "In Development",
        demoUrl: "#",
        githubUrl: "https://github.com/Abhijnan1/ai-chat",
        imageUrl: "/images/ai-chat-preview.jpg",
        category: "AI/ML",
        featured: true,
        createdAt: "2024-12-15",
        views: 0,
        likes: 0,
        difficulty: "Expert",
        completionTime: "4 months"
    }
];

// Skills data
const skills = {
    categories: [
        {
            id: 1,
            name: "Frontend Development",
            icon: "🌐",
            description: "Creating beautiful and interactive user interfaces",
            skills: [
                { name: "HTML5", level: 90, experience: "2 years", projects: 8 },
                { name: "CSS3", level: 85, experience: "2 years", projects: 8 },
                { name: "JavaScript", level: 80, experience: "1.5 years", projects: 6 },
                { name: "React", level: 70, experience: "1 year", projects: 3 },
                { name: "Responsive Design", level: 85, experience: "1.5 years", projects: 7 }
            ]
        },
        {
            id: 2,
            name: "Backend Development",
            icon: "⚙️",
            description: "Building robust server-side applications",
            skills: [
                { name: "Node.js", level: 75, experience: "1 year", projects: 4 },
                { name: "Express.js", level: 70, experience: "1 year", projects: 4 },
                { name: "REST APIs", level: 75, experience: "1 year", projects: 3 },
                { name: "Database Design", level: 65, experience: "8 months", projects: 2 },
                { name: "Authentication", level: 60, experience: "6 months", projects: 2 }
            ]
        },
        {
            id: 3,
            name: "Game Development",
            icon: "🎮",
            description: "Creating engaging and interactive games",
            skills: [
                { name: "Canvas API", level: 80, experience: "1 year", projects: 4 },
                { name: "Game Logic", level: 85, experience: "1 year", projects: 5 },
                { name: "AI Algorithms", level: 75, experience: "8 months", projects: 2 },
                { name: "Animation", level: 80, experience: "1 year", projects: 6 },
                { name: "Physics Simulation", level: 65, experience: "6 months", projects: 2 }
            ]
        },
        {
            id: 4,
            name: "Tools & Technologies",
            icon: "🛠️",
            description: "Development tools and modern technologies",
            skills: [
                { name: "Git & GitHub", level: 80, experience: "1.5 years", projects: 10 },
                { name: "VS Code", level: 90, experience: "2 years", projects: 15 },
                { name: "Chrome DevTools", level: 85, experience: "1.5 years", projects: 12 },
                { name: "NPM/Yarn", level: 75, experience: "1 year", projects: 8 },
                { name: "Webpack", level: 60, experience: "6 months", projects: 2 }
            ]
        }
    ],
    totalSkills: 20,
    averageLevel: 76,
    topSkills: ["Game Logic", "VS Code", "HTML5"]
};

// Achievements data
const achievements = [
    {
        id: 1,
        title: "First Game Launch",
        description: "Successfully created and deployed my first interactive game with AI opponent",
        icon: "💻",
        year: "2024",
        category: "Development",
        date: "2024-03-15",
        details: "Built a complete Tic-Tac-Toe game with unbeatable AI using minimax algorithm",
        impact: "Gained 500+ plays in first week",
        skills: ["JavaScript", "AI Algorithms", "Game Logic"]
    },
    {
        id: 2,
        title: "AI Implementation Master",
        description: "Implemented advanced AI algorithms for game development",
        icon: "🤖",
        year: "2024",
        category: "AI/ML",
        date: "2024-06-10",
        details: "Successfully implemented minimax algorithm with alpha-beta pruning",
        impact: "Created unbeatable AI opponent",
        skills: ["AI Algorithms", "JavaScript", "Optimization"]
    },
    {
        id: 3,
        title: "Portfolio Excellence",
        description: "Launched professional portfolio with advanced animations and backend",
        icon: "🌟",
        year: "2024",
        category: "Web Development",
        date: "2024-12-20",
        details: "Created modern portfolio with 3D effects, particle systems, and full-stack architecture",
        impact: "Showcased advanced development skills",
        skills: ["Full-Stack", "Animations", "Modern Design"]
    },
    {
        id: 4,
        title: "Academic Excellence",
        description: "Achieved top grades in mathematics and computer science",
        icon: "🏆",
        year: "2024",
        category: "Academic",
        date: "2024-06-30",
        details: "Maintained 95%+ average while pursuing programming projects",
        impact: "Balanced academics with practical development",
        skills: ["Mathematics", "Computer Science", "Time Management"]
    },
    {
        id: 5,
        title: "Performance Optimization",
        description: "Optimized application performance by 60% through efficient algorithms",
        icon: "⚡",
        year: "2024",
        category: "Performance",
        date: "2024-09-15",
        details: "Improved game rendering and logic efficiency significantly",
        impact: "Enhanced user experience across all projects",
        skills: ["Optimization", "Performance", "Algorithms"]
    }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get client IP address
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Get browser info from user agent
function getBrowserInfo(userAgent) {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
}

// Get device type from user agent
function getDeviceType(userAgent) {
    if (!userAgent) return 'Unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/.test(userAgent)) return 'Tablet';
    return 'Desktop';
}

// Generate date string
function getDateString() {
    return new Date().toISOString().split('T')[0];
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// ============================================================================
// API ROUTES - ANALYTICS
// ============================================================================

app.use('/api/analytics', apiLimiter);

// Track page view
app.post('/api/analytics/pageview', (req, res) => {
    try {
        const { page, userAgent, referrer } = req.body;
        const ip = getClientIP(req);
        const today = getDateString();
        
        // Increment page views
        analytics.pageViews++;
        
        // Track unique visitors
        analytics.uniqueVisitors.add(ip);
        
        // Track daily stats
        if (!analytics.dailyStats[today]) {
            analytics.dailyStats[today] = { views: 0, visitors: new Set() };
        }
        analytics.dailyStats[today].views++;
        analytics.dailyStats[today].visitors.add(ip);
        
        // Track browser stats
        const browser = getBrowserInfo(userAgent);
        analytics.browserStats[browser] = (analytics.browserStats[browser] || 0) + 1;
        
        // Track device stats
        const device = getDeviceType(userAgent);
        analytics.deviceStats[device] = (analytics.deviceStats[device] || 0) + 1;
        
        // Track referrer stats
        if (referrer && referrer !== window.location.href) {
            analytics.referrerStats[referrer] = (analytics.referrerStats[referrer] || 0) + 1;
        }
        
        res.json({
            success: true,
            message: 'Page view tracked successfully',
            data: {
                totalViews: analytics.pageViews,
                uniqueVisitors: analytics.uniqueVisitors.size
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track page view',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Track project view
app.post('/api/analytics/project/:id', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        analytics.projectViews[projectId] = (analytics.projectViews[projectId] || 0) + 1;
        project.views = (project.views || 0) + 1;
        
        res.json({
            success: true,
            message: 'Project view tracked successfully',
            data: {
                projectId,
                views: analytics.projectViews[projectId]
            }
        });
    } catch (error) {
        console.error('Project analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track project view'
        });
    }
});

// Track contact form submission
app.post('/api/analytics/contact-submission', (req, res) => {
    try {
        analytics.contactFormSubmissions++;
        
        res.json({
            success: true,
            message: 'Contact submission tracked successfully',
            data: {
                totalSubmissions: analytics.contactFormSubmissions
            }
        });
    } catch (error) {
        console.error('Contact analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track contact submission'
        });
    }
});

// Get analytics dashboard (protected in production)
app.get('/api/analytics/dashboard', (req, res) => {
    try {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const dailyViews = last7Days.map(date => ({
            date,
            views: analytics.dailyStats[date]?.views || 0,
            visitors: analytics.dailyStats[date]?.visitors.size || 0
        }));
        
        const topProjects = Object.entries(analytics.projectViews)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, views]) => {
                const project = projects.find(p => p.id === parseInt(id));
                return { 
                    projectId: parseInt(id), 
                    title: project?.title || 'Unknown',
                    views 
                };
            });
        
        const dashboardData = {
            overview: {
                totalPageViews: analytics.pageViews,
                uniqueVisitors: analytics.uniqueVisitors.size,
                contactSubmissions: analytics.contactFormSubmissions,
                avgDailyViews: Math.round(analytics.pageViews / Math.max(Object.keys(analytics.dailyStats).length, 1)),
                totalProjects: projects.length,
                totalSkills: skills.totalSkills
            },
            dailyViews,
            topProjects,
            browserStats: analytics.browserStats,
            deviceStats: analytics.deviceStats,
            referrerStats: analytics.referrerStats,
            recentActivity: getRecentActivity()
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics dashboard'
        });
    }
});

function getRecentActivity() {
    const activities = [];
    const today = getDateString();
    
    // Add recent page views
    if (analytics.dailyStats[today]) {
        activities.push({
            type: 'page_view',
            count: analytics.dailyStats[today].views,
            date: today,
            description: `${analytics.dailyStats[today].views} page views today`
        });
    }
    
    // Add recent project views
    Object.entries(analytics.projectViews).forEach(([projectId, views]) => {
        if (views > 0) {
            const project = projects.find(p => p.id === parseInt(projectId));
            activities.push({
                type: 'project_view',
                projectId: parseInt(projectId),
                projectTitle: project?.title || 'Unknown',
                count: views,
                date: today,
                description: `${views} views on ${project?.title || 'Unknown Project'}`
            });
        }
    });
    
    return activities.slice(0, 10);
}

// ============================================================================
// API ROUTES - PROJECTS
// ============================================================================

app.use('/api/projects', apiLimiter);

// Get all projects
app.get('/api/projects', (req, res) => {
    try {
        const { category, featured, status, difficulty } = req.query;
        let filteredProjects = [...projects];

        if (category) {
            filteredProjects = filteredProjects.filter(project => 
                project.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (featured !== undefined) {
            filteredProjects = filteredProjects.filter(project => 
                project.featured === (featured === 'true')
            );
        }

        if (status) {
            filteredProjects = filteredProjects.filter(project => 
                project.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (difficulty) {
            filteredProjects = filteredProjects.filter(project => 
                project.difficulty.toLowerCase() === difficulty.toLowerCase()
            );
        }

        // Sort by creation date (newest first)
        filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: filteredProjects,
            total: filteredProjects.length,
            filters: {
                categories: [...new Set(projects.map(p => p.category))],
                statuses: [...new Set(projects.map(p => p.status))],
                difficulties: [...new Set(projects.map(p => p.difficulty))]
            }
        });
    } catch (error) {
        console.error('Projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Increment view count
        project.views = (project.views || 0) + 1;

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
});

// Like/unlike project
app.post('/api/projects/:id/like', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.likes = (project.likes || 0) + 1;

        res.json({
            success: true,
            message: 'Project liked successfully',
            data: {
                projectId,
                likes: project.likes
            }
        });
    } catch (error) {
        console.error('Project like error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like project'
        });
    }
});

// Get project categories and stats
app.get('/api/projects/meta/stats', (req, res) => {
    try {
        const categories = [...new Set(projects.map(p => p.category))];
        const statuses = [...new Set(projects.map(p => p.status))];
        const difficulties = [...new Set(projects.map(p => p.difficulty))];
        
        const stats = {
            total: projects.length,
            featured: projects.filter(p => p.featured).length,
            categories: categories.map(category => ({
                name: category,
                count: projects.filter(p => p.category === category).length,
                projects: projects.filter(p => p.category === category).map(p => ({
                    id: p.id,
                    title: p.title,
                    status: p.status
                }))
            })),
            statuses: statuses.map(status => ({
                name: status,
                count: projects.filter(p => p.status === status).length
            })),
            difficulties: difficulties.map(difficulty => ({
                name: difficulty,
                count: projects.filter(p => p.difficulty === difficulty).length
            })),
            totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0),
            totalLikes: projects.reduce((sum, p) => sum + (p.likes || 0), 0),
            recent: projects
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Project stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project statistics'
        });
    }
});

// ============================================================================
// API ROUTES - SKILLS
// ============================================================================

app.use('/api/skills', apiLimiter);

// Get all skills
app.get('/api/skills', (req, res) => {
    try {
        const { category } = req.query;
        let skillsData = { ...skills };

        if (category) {
            skillsData.categories = skillsData.categories.filter(cat => 
                cat.name.toLowerCase().includes(category.toLowerCase())
            );
        }

        res.json({
            success: true,
            data: skillsData
        });
    } catch (error) {
        console.error('Skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skills'
        });
    }
});

// Get skills by category
app.get('/api/skills/category/:categoryId', (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const category = skills.categories.find(cat => cat.id === categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Skill category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Skill category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skill category'
        });
    }
});

// Get skill statistics
app.get('/api/skills/stats', (req, res) => {
    try {
        const allSkills = skills.categories.flatMap(cat => cat.skills);
        
        const stats = {
            totalSkills: skills.totalSkills,
            averageLevel: skills.averageLevel,
            topSkills: skills.topSkills,
            categoriesCount: skills.categories.length,
            skillsByLevel: {
                expert: allSkills.filter(skill => skill.level >= 85).length,
                advanced: allSkills.filter(skill => skill.level >= 70 && skill.level < 85).length,
                intermediate: allSkills.filter(skill => skill.level >= 50 && skill.level < 70).length,
                beginner: allSkills.filter(skill => skill.level < 50).length
            },
            skillsByExperience: {
                '2+ years': allSkills.filter(skill => parseFloat(skill.experience) >= 2).length,
                '1-2 years': allSkills.filter(skill => {
                    const exp = parseFloat(skill.experience);
                    return exp >= 1 && exp < 2;
                }).length,
                '< 1 year': allSkills.filter(skill => parseFloat(skill.experience) < 1).length
            },
            totalProjects: allSkills.reduce((sum, skill) => sum + (skill.projects || 0), 0),
            mostUsedSkills: allSkills
                .sort((a, b) => (b.projects || 0) - (a.projects || 0))
                .slice(0, 5)
                .map(skill => ({
                    name: skill.name,
                    projects: skill.projects || 0,
                    level: skill.level
                }))
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Skill stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skill statistics'
        });
    }
});

// ============================================================================
// API ROUTES - ACHIEVEMENTS
// ============================================================================

app.use('/api/achievements', apiLimiter);

// Get all achievements
app.get('/api/achievements', (req, res) => {
    try {
        const { category, year } = req.query;
        let filteredAchievements = [...achievements];

        if (category) {
            filteredAchievements = filteredAchievements.filter(achievement => 
                achievement.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (year) {
            filteredAchievements = filteredAchievements.filter(achievement => 
                achievement.year === year
            );
        }

        // Sort by date (newest first)
        filteredAchievements.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: filteredAchievements,
            total: filteredAchievements.length,
            filters: {
                categories: [...new Set(achievements.map(a => a.category))],
                years: [...new Set(achievements.map(a => a.year))]
            }
        });
    } catch (error) {
        console.error('Achievements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements'
        });
    }
});

// Get single achievement
app.get('/api/achievements/:id', (req, res) => {
    try {
        const achievementId = parseInt(req.params.id);
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        res.json({
            success: true,
            data: achievement
        });
    } catch (error) {
        console.error('Achievement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievement'
        });
    }
});

// Get achievement statistics
app.get('/api/achievements/meta/stats', (req, res) => {
    try {
        const categories = [...new Set(achievements.map(a => a.category))];
        const years = [...new Set(achievements.map(a => a.year))];
        
        const stats = {
            total: achievements.length,
            categories: categories.map(category => ({
                name: category,
                count: achievements.filter(a => a.category === category).length,
                achievements: achievements
                    .filter(a => a.category === category)
                    .map(a => ({ id: a.id, title: a.title, year: a.year }))
            })),
            byYear: years.map(year => ({
                year,
                count: achievements.filter(a => a.year === year).length,
                achievements: achievements
                    .filter(a => a.year === year)
                    .map(a => ({ id: a.id, title: a.title, category: a.category }))
            })),
            recent: achievements
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3),
            skillsInvolved: [...new Set(achievements.flatMap(a => a.skills || []))],
            totalImpact: achievements.length * 100 // Simplified impact calculation
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Achievement stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievement statistics'
        });
    }
});

// ============================================================================
// API ROUTES - CONTACT
// ============================================================================

app.use('/api/contact', contactLimiter);

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        let { name, email, subject, message, phone, company, projectType } = req.body;

        // Sanitize inputs
        name = sanitizeInput(name);
        email = sanitizeInput(email);
        subject = sanitizeInput(subject);
        message = sanitizeInput(message);
        phone = sanitizeInput(phone);
        company = sanitizeInput(company);
        projectType = sanitizeInput(projectType);

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject, and message are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                code: 'INVALID_EMAIL_FORMAT'
            });
        }

        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2 and 100 characters',
                code: 'INVALID_NAME_LENGTH'
            });
        }

        if (subject.length < 5 || subject.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'Subject must be between 5 and 200 characters',
                code: 'INVALID_SUBJECT_LENGTH'
            });
        }

        if (message.length < 10 || message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Message must be between 10 and 2000 characters',
                code: 'INVALID_MESSAGE_LENGTH'
            });
        }

        const timestamp = new Date().toLocaleString();
        const clientIP = getClientIP(req);

        // Prepare email content for admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'abhijnansahariah18@gmail.com',
            subject: `Portfolio Contact: ${subject}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Portfolio Website</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Contact Information</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name:</td>
                                    <td style="padding: 8px 0; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                                    <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                                </tr>
                                ${phone ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                                    <td style="padding: 8px 0; color: #333;">${phone}</td>
                                </tr>
                                ` : ''}
                                ${company ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Company:</td>
                                    <td style="padding: 8px 0; color: #333;">${company}</td>
                                </tr>
                                ` : ''}
                                ${projectType ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Project Type:</td>
                                    <td style="padding: 8px 0; color: #333;">${projectType}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td>
                                    <td style="padding: 8px 0; color: #333;">${subject}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">Message:</h3>
                            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; line-height: 1.6; color: #333;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 14px; color: #666;">
                            <p style="margin: 0;"><strong>Submission Details:</strong></p>
                            <p style="margin: 5px 0 0 0;">Time: ${timestamp}</p>
                            <p style="margin: 5px 0 0 0;">IP Address: ${clientIP}</p>
                            <p style="margin: 5px 0 0 0;">User Agent: ${req.headers['user-agent'] || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send email to admin
        await transporter.sendMail(adminMailOptions);

        // Prepare auto-reply email for user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting me! - Abhijnan Sahariah',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your message has been received</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">Hi ${name},</p>
                        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
                            Thank you for reaching out! I've received your message and will get back to you as soon as possible. 
                            I typically respond within 24-48 hours.
                        </p>
                        
                        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Your Message Summary:</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 5px 0; font-weight: bold; color: #555; width: 80px;">Subject:</td>
                                    <td style="padding: 5px 0; color: #333;">${subject}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
                                    <td style="padding: 5px 0; color: #333;">${message.substring(0, 150)}${message.length > 150 ? '...' : ''}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">What happens next?</h3>
                            <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li>I'll review your message carefully</li>
                                <li>I'll respond with detailed information about your inquiry</li>
                                <li>If it's a project inquiry, I'll provide a timeline and next steps</li>
                                <li>Feel free to follow up if you don't hear back within 48 hours</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #555; margin: 0 0 15px 0;">Connect with me on social media:</p>
                            <div style="display: inline-block;">
                                <a href="https://github.com/Abhijnan1" style="display: inline-block; margin: 0 10px; padding: 10px 15px; background: #333; color: white; text-decoration: none; border-radius: 5px;">GitHub</a>
                                <a href="mailto:abhijnansahariah18@gmail.com" style="display: inline-block; margin: 0 10px; padding: 10px 15px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Email</a>
                            </div>
                        </div>
                        
                        <p style="color: #555; line-height: 1.6; margin: 20px 0 0 0;">
                            Best regards,<br>
                            <strong>Abhijnan Sahariah</strong><br>
                            <span style="color: #888; font-size: 14px;">Student Developer & AI Enthusiast</span>
                        </p>
                        
                        <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 5px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                This is an automated response. Please do not reply to this email.<br>
                                If you need immediate assistance, please send a new message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send auto-reply to user
        await transporter.sendMail(userMailOptions);

        // Track the contact submission
        analytics.contactFormSubmissions++;

        res.json({
            success: true,
            message: 'Message sent successfully! You will receive a confirmation email shortly.',
            data: {
                submissionId: Date.now(),
                timestamp: timestamp,
                estimatedResponse: '24-48 hours'
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            code: 'EMAIL_SEND_ERROR',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// ============================================================================
// API ROUTES - GENERAL
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running smoothly',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get server statistics
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version,
                platform: process.platform
            },
            api: {
                totalProjects: projects.length,
                totalSkills: skills.totalSkills,
                totalAchievements: achievements.length,
                totalPageViews: analytics.pageViews,
                uniqueVisitors: analytics.uniqueVisitors.size,
                contactSubmissions: analytics.contactFormSubmissions
            }
        }
    });
});

// ============================================================================
// SERVE STATIC FILES AND MAIN APPLICATION
// ============================================================================

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve other HTML files
app.get('/*.html', (req, res) => {
    const fileName = req.params[0] + '.html';
    const filePath = path.join(__dirname, 'public', fileName);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        availableEndpoints: [
            'GET /api/health',
            'GET /api/stats',
            'GET /api/projects',
            'GET /api/skills',
            'GET /api/achievements',
            'POST /api/contact',
            'GET /api/analytics/dashboard'
        ]
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        code: err.code || 'INTERNAL_SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err
        } : 'Internal server error'
    });
});

// 404 handler for all other routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        requestedPath: req.path
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log('\n🚀 ===============================================');
    console.log('🌟 FULL-STACK PORTFOLIO SERVER STARTED');
    console.log('🚀 ===============================================');
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
    console.log('🚀 ===============================================');
    console.log('\n📋 Available API Endpoints:');
    console.log('   📊 Analytics: /api/analytics/*');
    console.log('   🎯 Projects: /api/projects');
    console.log('   🛠️  Skills: /api/skills');
    console.log('   🏆 Achievements: /api/achievements');
    console.log('   📧 Contact: /api/contact');
    console.log('   ❤️  Health: /api/health');
    console.log('   📈 Stats: /api/stats');
    console.log('\n🎨 Frontend Features:');
    console.log('   ✨ Advanced Animations');
    console.log('   🎮 Interactive Elements');
    console.log('   📱 Mobile Responsive');
    console.log('   ♿ Accessibility Compliant');
    console.log('   🔒 Security Hardened');
    console.log('   ⚡ Performance Optimized');
    console.log('\n🚀 ===============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;