# SkillShare Hub

## Overview

SkillShare Hub is an online platform where users can share skills, offer lessons, and learn from others. The platform provides user authentication, profile management, skill offerings, a booking system, and a review system. Additionally, it includes an admin dashboard for managing users, skills, and bookings.

## Features

### User Authentication

- **Registration & Login:** Secure user authentication using JWT.
- **Role-Based Access Control:** Different access levels for users and admins.

### User Profiles

- **Profile Management:** Users can create and update profiles with bio, photo, skills offered, and reviews.
- **Public Profiles:** Profiles are accessible publicly with user statistics.

### Skill Offering

- **Create Listings:** Users can offer skills by creating listings with title, description, price, and availability.
- **Categories:** Skills are categorized (e.g., programming, cooking, music).

### Booking System

- **Book Lessons:** Users can book lessons from available skill offerings.
- **Scheduling:** Integration with a calendar for lesson scheduling.
- **Notifications:** Reminders for upcoming lessons.

### Review System

- **Leave Reviews:** Users can leave reviews and ratings after lessons.
- **Aggregate Ratings:** Each skill provider has an overall rating.

### Admin Dashboard

- **User & Skill Management:** Admins can manage users, skills, and bookings.
- **Analytics:** Dashboard showing platform usage, popular skills, etc.

### Optional Features

- **Messaging System:** In-app messaging for communication before/after booking.
- **Payment Integration:** Integrate with Stripe for handling paid lessons.

## Tech Stack

### Backend (NestJS)

- **NestJS:** API framework.
- **TypeORM:** Database management with PostgreSQL.
- **Passport.js:** Authentication with JWT.
- **Swagger:** API documentation.
- **Socket.IO (Optional):** Real-time messaging.

### Frontend

- **React:** Front-end framework .
- **Tailwind CSS:** Styling.
- **Axios:** API requests.

### Database

- **PostgreSQL:** Relational database management.
- **Redis (Optional):** Caching and session management.

### DevOps

- **Docker:** Containerization.
- **Heroku/DigitalOcean:** Deployment.
- **GitHub Actions:** CI/CD pipeline.

## Development Steps

1. **Project Setup:**
   - Initialize NestJS project.
   - Set up PostgreSQL database.
   - Configure environment variables.

2. **User Authentication:**
   - Implement JWT-based authentication.
   - Set up role-based access control.

3. **User Profile Management:**
   - APIs for profile creation and updates.
   - Implement file upload for profile pictures.

4. **Skill Offering:**
   - Design skill offerings schema.
   - CRUD operations for skill listings.

5. **Booking System:**
   - Implement booking APIs.
   - Calendar integration for scheduling.

6. **Review System:**
   - Design and implement review and rating feature.

7. **Admin Dashboard:**
   - Build admin panel for managing users, skills, and bookings.

8. **Frontend Development:**
   - Build UI with React/Next.js.
   - Integrate with backend API.
   - Implement client-side authentication and state management.

9. **Real-Time Features (Optional):**
   - Implement messaging with Socket.IO.

10. **Payment Integration (Optional):**
    - Integrate Stripe for payments.

11. **Testing & Deployment:**
    - Write unit and integration tests.
    - Set up CI/CD pipelines.
    - Deploy to cloud provider.

## Learning Outcomes

- **NestJS:** Building RESTful APIs, managing databases, handling authentication.
- **TypeORM:** Mastering ORM tools for database interactions.
- **Frontend Development:** Building responsive UIs with React/Angular.
- **DevOps:** Containerization, CI/CD, and deployment practices.
- **Advanced Features:** Real-time communication, payment processing.

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/andrenormanlang/skillshare-hub.git
   ```

2. **Install Dependencies:**

   ```bash
   cd skillshare-hub/backend
   npm install
   ```

3. **Set Up Environment Variables:**
   - Create a `.env` file and add your configuration.

4. **Run the Application:**

   ```bash
   npm run start:dev
   ```

5. **Access the Application:**
   - Open `http://localhost:3000` in your browser.

## Contributing

Feel free to fork this repository, create a new branch, and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
