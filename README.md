# Moodify

Moodify: Discover Entertainment That Matches Your Vibe 🎵🎬

(banner image)

🚀 Introduction

Moodify is a full-stack web application designed to solve decision paralysis by recommending movies and music based on your current emotional state.

Unlike traditional algorithms that rely solely on viewing history, Moodify asks, "How are you feeling?" and curates a personalized mix of entertainment using the Spotify and TMDB (The Movie Database) APIs. Whether you are feeling Happy, Sad, Energetic, Chill, or Romantic, Moodify has something for you.

✨ Key Features

🎭 Mood-Based Engine: Select your mood and get instant, tailored recommendations for both a movie and a song.

🎧 Integrated Spotify Player: Listen to recommended tracks directly within the app using the embedded player.

🎥 Movie Trailers: Watch movie trailers instantly via the integrated YouTube player without leaving the site.

🧠 Smart Search & Discovery: Search for any song or movie. The system learns from your favorites to refine future recommendations.

📂 User Profiles: Create an account to save your favorite tracks and movies. Build your personal "Vibe Collection."

📱 Responsive Design: A modern, dark-themed UI built with Tailwind CSS that works seamlessly on desktop and mobile.

📸 Screenshots

Home Page

Dashboard





Landing page with trending content

Mood selection and results

Movie Details

Music Player





Detailed movie info with trailer

Embedded Spotify player



🛠️ Tech Stack

Moodify is built using the MERN Stack:

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js 

Database: MongoDB

APIs: Spotify Web API, TMDB API.

Authentication: JWT (JSON Web Tokens).

⚙️ Installation & Setup

Follow these steps to run Moodify locally on your machine.

Prerequisites

Node.js (v14 or higher)

MongoDB Atlas Account (or local MongoDB)

Spotify Developer Account (Client ID & Secret)

TMDB API Key

1. Clone the Repository

git clone [https://github.com/YourUsername/Moodify.git](https://github.com/YourUsername/Moodify.git)
cd Moodify


2. Backend Setup

Navigate to the server folder and install dependencies:

cd server
npm install


Create a .env file in the server directory and add your API keys:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback

# TMDB API
TMDB_API_KEY=your_tmdb_api_key


Start the backend server:

npx nodemon index.js


(You should see "Server running on port 5000" and "MongoDB Connected")

3. Frontend Setup

Open a new terminal, navigate to the client folder, and install dependencies:

cd client
npm install


Start the React application:

npm start


(The app should open at http://localhost:3000)

🧠 How the Algorithm Works

User Input: The user selects a mood (e.g., "Sad").

Contextual Search:

The system checks the user's Favorite Tracks.

If a favorite song matches the "Sad" mood, the algorithm uses that artist as a seed to find similar sad songs.

If no favorites exist, it performs a smart search using keywords like "Sad songs", "Melancholy", "Acoustic".

Filtering: Results are sorted by popularity to ensure high-quality recommendations.

Pairing: A movie with a matching genre (e.g., Drama for "Sad") is fetched from TMDB to complete the experience.

🤝 Contributing

Contributions are welcome! If you have suggestions or bug fixes:

Fork the repository.

Create a new branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📄 License

This project is open-source and available under the MIT License.

Contact

Project Link: https://github.com/ChayLuck/Moodify
