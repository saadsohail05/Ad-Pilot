# AdPilot

<div align="center">
  <img src="Frontend/my-app/public/images/logo/banner.png" alt="AdPilot Logo" width="100%" style="max-width: 800px; height: auto;">
  <h3>AI-Powered Advertising Platform for Startups and Teams with Low Marketing Budgets</h3>
</div>

<div align="center">
  <a href="#demo">Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#custom-ai-models">Custom AI Models</a> •
  <a href="#api-documentation">API Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</div>

## Demo

<div align="center">
  <a href="https://drive.google.com/file/d/13nKJwJKhAQknXQ0rpIj3ceZxzB3JAlDY/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/Watch_Demo-Video-red?style=for-the-badge&logo=google-drive" alt="Watch Demo Video" />
  </a>
</div>

<p align="center">Click the button above to watch a comprehensive demonstration of AdPilot in action.</p>

<div align="center">
  <p><strong>Demo Highlights:</strong></p>
  <ul style="display: inline-block; text-align: left;">
    <li>User registration and authentication flow</li>
    <li>Campaign creation and management</li>
    <li>AI-powered ad copy generation using fine-tuned Llama 3.2</li>
    <li>Image generation for advertisements</li>
    <li>Campaign scheduling and publishing</li>
    <li>Analytics dashboard and performance tracking</li>
  </ul>
</div>

## Overview

AdPilot is a comprehensive AI-powered advertising platform designed specifically for startups and teams with limited marketing budgets. It leverages artificial intelligence to help businesses create, manage, and optimize advertising campaigns across multiple platforms including Facebook and Instagram.

The platform provides tools for market analysis, content generation, image creation, and campaign management, all integrated into a seamless user experience. AdPilot aims to democratize access to professional-grade advertising tools, making them accessible to businesses of all sizes.

## Features

### 🚀 Core Features

- **User Authentication & Management**
  - Secure registration and login system
  - Email verification
  - JWT-based authentication with refresh tokens
  - User profile management

- **Campaign Creation & Management**
  - Create and manage advertising campaigns
  - Schedule posts for future publication
  - Track campaign performance metrics
  - Support for multiple social media platforms (Facebook, Instagram)

- **AI-Powered Content Generation**
  - Generate advertisement copy based on product descriptions using fine-tuned Llama 3.2
  - Create professional marketing content with specialized ad-focused language models
  - Produce market analysis reports
  - Custom-trained models optimized for advertising copy

- **Image Generation**
  - AI-powered image generation for advertisements
  - Custom image styling based on mood and style preferences
  - Image storage and management

- **Market Insights & Analytics**
  - Detailed market analysis
  - Campaign performance tracking
  - Data visualization and reporting
  - PDF report generation

- **AI Chatbot Assistant**
  - Conversational interface for campaign insights
  - Performance recommendations
  - Marketing strategy suggestions

### 🌐 Platform Support

- **Facebook Integration**
  - Post creation and scheduling
  - Campaign management
  - Ad set configuration
  - Creative asset management

- **Instagram Integration**
  - Post creation and scheduling
  - Campaign management
  - Platform-specific optimizations

## Tech Stack

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript/JavaScript
- **UI Components**: React
- **Styling**: CSS/Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.12+
- **Database**: PostgreSQL with SQLModel ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Caching**: Redis
- **Task Queue**: Background Tasks
- **API Integration**: Facebook Graph API, Instagram API

### AI & Machine Learning

- **LLM Integration**: Together AI (Llama 3.2)
- **Custom LLM**: Fine-tuned Llama 3.2 for advertising content generation
- **Local LLM Deployment**: Ollama for efficient model serving
- **Image Generation**: FLUX.1-Schnell Model
- **Data Analysis**: Pandas, Matplotlib, Seaborn
- **PDF Generation**: ReportLab

### DevOps & Infrastructure

- **Package Management**: Poetry (Backend), npm/yarn (Frontend)
- **Environment Management**: dotenv
- **Image Storage**: Cloudinary
- **CORS Handling**: FastAPI CORS Middleware

## Architecture

AdPilot follows a modern client-server architecture:

```
AdPilot/
├── Frontend/                # Next.js frontend application
│   └── my-app/
│       ├── public/          # Static assets
│       ├── src/             # Source code
│       │   ├── app/         # Next.js app router
│       │   ├── components/  # React components
│       │   ├── context/     # Context providers
│       │   └── styles/      # CSS styles
│       └── package.json     # Frontend dependencies
│
└── Backend/                 # FastAPI backend application
    └── adpilot/
        ├── adpilot/         # Main application code
        │   ├── router/      # API routes
        │   ├── models.py    # Database models
        │   ├── auth.py      # Authentication logic
        │   ├── db.py        # Database connection
        │   ├── main.py      # Application entry point
        │   └── ...          # Other modules
        ├── pyproject.toml   # Backend dependencies
        └── poetry.lock      # Locked dependencies
```

## Installation

### Prerequisites

- Python 3.12+
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Redis server
- Cloudinary account
- Together AI API key
- Ollama (for local LLM deployment)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/saadsohail05/Ad-Pilot.git
   cd Ad-Pilot/Backend/adpilot
   ```

2. Install Poetry (if not already installed):
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

3. Install dependencies:
   ```bash
   poetry install
   ```

4. Create a `.env` file in the `Backend/adpilot` directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/adpilot
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Together AI API key
   TOGETHER_API_KEY=your_together_api_key

   # Ollama configuration
   OLLAMA_HOST=http://localhost:11434

   # Facebook/Instagram API credentials
   FB_ACCESS_TOKEN=your_facebook_access_token
   FB_ACCOUNT_ID=your_facebook_account_id
   FB_PAGE_ID=your_facebook_page_id
   ```

5. Start the backend server:
   ```bash
   poetry run uvicorn adpilot.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Ad-Pilot/Frontend/my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### User Registration and Login

1. Navigate to the signup page and create a new account
2. Verify your email address through the verification link
3. Log in with your credentials

### Creating a Campaign

1. Navigate to the "Create Campaign" section
2. Fill in the campaign details (name, platform, etc.)
3. Proceed to the ad creation step

### Generating Ad Content

1. Enter your product details and description
2. Use the AI-powered content generator to create ad copy
3. Customize the generated content as needed

### Creating Ad Images

1. Describe the desired image or use the AI to generate image prompts
2. Select style and mood preferences
3. Generate and preview the image
4. Save or regenerate as needed

### Launching a Campaign

1. Review your campaign details, ad copy, and images
2. Choose between immediate posting or scheduling for later
3. Select targeting options (if applicable)
4. Launch the campaign

### Monitoring Performance

1. Navigate to the dashboard to view campaign metrics
2. Analyze performance data and insights
3. Use the AI chatbot for performance recommendations

## Custom AI Models

### Fine-tuned Llama 3.2 for Ad Generation

AdPilot leverages a custom fine-tuned version of Llama 3.2 specifically optimized for advertising content generation:

- **Training Data**: Curated dataset of high-performing advertising copy across various industries and platforms
- **Optimization**: Fine-tuned to generate persuasive, concise, and conversion-focused ad content
- **Deployment**: Served locally using Ollama for fast inference and data privacy
- **Capabilities**:
  - Generates platform-specific ad copy (Facebook, Instagram)
  - Creates headlines, body text, and calls-to-action
  - Adapts tone and style based on target audience and product category
  - Optimizes for engagement metrics

### Fine-tuning Process

- **Base Model**: Llama 3.2 (8B parameter version)
- **Training Method**: Low-rank adaptation (LoRA) fine-tuning
- **Training Data**: 10,000+ high-performing ads across various industries
- **Hyperparameters**:
  - Learning rate: 2e-5
  - Epochs: 3
  - Batch size: 8
  - LoRA rank: 16
  - LoRA alpha: 32
- **Evaluation Metrics**: ROUGE, BLEU, and human evaluation for creativity and persuasiveness

### AdLlama API

The custom model is exposed through a dedicated API endpoint that provides:

- Specialized temperature settings for creative ad generation
- Optimized context handling for product descriptions
- Consistent brand voice maintenance
- Industry-specific terminology and best practices

### Ollama Integration

AdPilot uses Ollama to efficiently serve and manage the fine-tuned models:

- **Local Deployment**: Models run locally for faster inference and data privacy
- **Model Management**: Easy switching between different fine-tuned versions
- **Resource Efficiency**: Optimized for running on standard hardware without requiring specialized GPUs
- **API Interface**: RESTful API for seamless integration with the backend
- **Custom Model Format**: Packaged using Ollama's Modelfile format with specific parameters for advertising tasks

## API Documentation

The backend API is documented using Swagger UI. Once the backend server is running, you can access the API documentation at:

```
http://localhost:8000/docs
```

This interactive documentation allows you to:
- View all available endpoints
- Understand request and response formats
- Test API calls directly from the browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Together AI](https://together.ai/)
- [Llama 3.2](https://ai.meta.com/llama/)
- [Ollama](https://ollama.ai/)
- [Cloudinary](https://cloudinary.com/)
- [SQLModel](https://sqlmodel.tiangolo.com/)
- [React Hook Form](https://react-hook-form.com/)
