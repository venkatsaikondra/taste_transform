# Taste Transform - Project Description

## 📖 Overview

**Taste Transform** is a comprehensive AI-powered recipe generation and community platform that revolutionizes the way people discover, create, and share culinary experiences. Built with modern web technologies, the platform combines artificial intelligence with social features to create an engaging cooking and recipe management ecosystem.

## 🎯 Project Vision

Taste Transform aims to solve common cooking challenges by:
- Helping users make the most of available ingredients
- Reducing food waste through intelligent recipe suggestions
- Democratizing recipe creation with AI assistance
- Building a supportive community of food enthusiasts
- Making cooking more accessible and enjoyable for everyone

## 🏗️ Architecture

### Frontend Architecture
- **Framework**: Next.js 14+ with App Router architecture
- **Language**: TypeScript for type safety and better developer experience
- **Styling**: CSS Modules for component-scoped styling
- **State Management**: React hooks and server components
- **Animations**: Lottie for smooth, performant animations

### Backend Architecture
- **API Design**: RESTful API using Next.js Route Handlers
- **Database**: MongoDB with Mongoose ODM for flexible data modeling
- **Authentication**: Session-based authentication with secure middleware
- **AI Integration**: Hugging Face API for recipe generation
- **External APIs**: YouTube API for recipe video integration

### Database Models
1. **User Model** (`userModel.js`)
   - User authentication and profile information
   - Saved recipes and preferences
   - Community engagement tracking

2. **Recipe Model** (`recipeModel.js`)
   - Recipe details (ingredients, instructions, metadata)
   - Publishing status (private/community)
   - User relationships and authorship

3. **Comment Model** (`commentModel.js`)
   - Community engagement features
   - Recipe discussions and feedback

## 🚀 Core Features

### 1. AI Recipe Generation
Users can generate custom recipes by:
- Inputting available ingredients
- Specifying dietary preferences
- Setting difficulty levels
- Adding cuisine preferences

The AI (powered by Hugging Face) creates unique, personalized recipes with:
- Ingredient lists with quantities
- Step-by-step cooking instructions
- Estimated cooking and prep times
- Nutritional information suggestions

### 2. Smart Fridge Management
The fridge feature allows users to:
- Track current ingredients and quantities
- Set expiration dates
- Get recipe suggestions based on available items
- Minimize food waste with smart recommendations
- Organize ingredients by category

### 3. Community Platform
A vibrant community where users can:
- Browse recipes shared by other users
- Publish their own creations
- Comment and interact with recipes
- Follow favorite recipe creators
- Discover trending dishes

### 4. User Dashboard
Personalized dashboard featuring:
- Quick access to saved recipes
- Recent recipe generation history
- Community activity feed
- Ingredient inventory summary
- Personalized recommendations

### 5. Profile Management
Comprehensive user profiles with:
- Personal information and preferences
- Published recipe portfolio
- Saved favorite recipes
- Cooking activity statistics
- Social connections

### 6. Interactive Chat Assistant
AI-powered chat interface for:
- Cooking tips and guidance
- Recipe modifications and substitutions
- Cooking technique questions
- Ingredient information
- Real-time culinary assistance

## 🔐 Security Features

- Secure user authentication with hashed passwords
- Session-based authorization
- Protected API routes with middleware
- Input validation and sanitization
- Environment variable protection for sensitive data

## 🎨 User Interface

### Design Principles
- **Intuitive Navigation**: Easy-to-use menu system
- **Responsive Design**: Mobile-first approach
- **Visual Appeal**: Modern, clean aesthetics
- **Performance**: Fast loading times with optimized assets
- **Accessibility**: Following WCAG guidelines

### Key UI Components
- **Loading Screen**: Engaging Lottie animations during data fetching
- **Interactive Menu**: Smooth navigation between features
- **Recipe Cards**: Visually appealing recipe displays
- **Chat Interface**: Conversational AI interaction
- **Form Components**: User-friendly input handling

## 📊 API Endpoints

### Recipe Management
- `POST /api/generate-recipe` - Generate new AI recipes
- `GET /api/recipes` - Fetch user's recipes
- `POST /api/recipes` - Create new recipe manually
- `GET /api/recipes/[id]` - Get specific recipe details
- `PUT /api/recipes/[id]` - Update existing recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/save` - Save recipe to profile
- `POST /api/recipes/publish` - Publish recipe to community

### User Management
- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - Authenticate user
- `POST /api/users/logout` - End user session
- `GET /api/users/me` - Get current user information

### Community Features
- `GET /api/community` - Browse community recipes
- `POST /api/community/comment` - Add recipe comments
- `GET /api/community/trending` - Get trending recipes

### External Integrations
- `GET /api/youtube` - Search for recipe videos

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- MongoDB database (local or Atlas)
- Hugging Face API account
- (Optional) YouTube API key

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/taste_transform
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXX
NEXTAUTH_SECRET=your_secret_key
NODE_ENV=development
```

### Development Workflow
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`
5. Access at `http://localhost:3000`

## 📈 Future Enhancements

### Planned Features
- **Meal Planning**: Weekly meal plan generation
- **Shopping Lists**: Auto-generated grocery lists
- **Advanced Filters**: More recipe search options
- **Social Features**: Follow system and activity feeds
- **Recipe Ratings**: User reviews and ratings
- **Cooking Timer**: Integrated cooking timers
- **Voice Commands**: Hands-free cooking assistance
- **Recipe Scaling**: Automatic ingredient adjustment
- **Nutritional Analysis**: Detailed nutrition information
- **Multi-language Support**: Internationalization

### Technical Improvements
- **Performance Optimization**: Image optimization, caching
- **Testing**: Unit and integration tests
- **CI/CD Pipeline**: Automated deployment
- **Analytics**: User behavior tracking
- **PWA Features**: Offline functionality
- **Real-time Updates**: WebSocket integration

## 🌍 Use Cases

1. **Home Cooks**: Discover new recipes based on available ingredients
2. **Food Enthusiasts**: Share culinary creations with community
3. **Meal Preppers**: Plan and organize weekly meals
4. **Dietary Restricted**: Find recipes matching dietary needs
5. **Learning Cooks**: Get guidance through AI chat assistant
6. **Content Creators**: Build recipe portfolio and following

## 🤝 Contributing

We welcome contributions! Areas where you can help:
- Feature development
- Bug fixes
- Documentation improvements
- UI/UX enhancements
- Testing
- Translation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team & Support

For questions, suggestions, or support:
- Open an issue on GitHub
- Contact the development team
- Join our community discussions

---

**Built with ❤️ by the Taste Transform Team**
