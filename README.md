# Speech Tracker Front-End

This is the React front-end application for the Speech Tracker project. It is built with Expo (React Native) to support web, iOS, and Android platforms.

## Project Setup and Installation

1. **Install Dependencies:** Run `npm install` or `yarn install` in the project directory to install all required packages.
2. **Configure Backend URL:** By default, the app is configured to connect to a backend running at `http://localhost:8000`. If your FastAPI backend is running elsewhere (for example, on a different host or port, or on an Android emulator), update the `API_BASE` constant in `src/api.js` accordingly (for Android emulator use `http://10.0.2.2:8000` for localhost).
3. **Start the Application:**
   - For web: run `npm run web` (or `expo start --web`) and open the provided URL in your browser.
   - For Android: run `npm run android` (or `expo start --android`) to launch on an emulator or connected device.
   - For iOS: run `npm run ios` (or `expo start --ios`) to launch on an iOS simulator or device.

Make sure your backend FastAPI server is running and accessible at the configured `API_BASE` URL before using the app.

## Usage

- **Authentication:** Create a new account or log in with existing credentials. Upon successful login, an authentication token is stored in memory and used for subsequent API requests.
- **Child Profiles:** After logging in, you can create a child profile (name, birthdate, gender). The app supports multiple children per account. Select a child profile to view details and recordings.
- **Recording Speech:** Within a child's profile, start a new recording to capture the child's speech. Press the **Start Recording** button and speak; press **Stop Recording** when finished. You may re-record if needed, or proceed to upload for analysis.
- **Analysis Results:** Once a recording is uploaded, the app will process the audio. This may take a few moments. When processing is complete, the app will display detailed analysis results for that recording, including lexical counts (utterances, tokens, etc.), mean length of utterance (MLU), speech rate (words per minute), vocabulary distribution, and other linguistic metrics. If no prior recordings exist, the global analysis will be generated after the first recording.
- **Past Recordings:** The child profile screen lists all past recordings. You can tap a completed recording to view its analysis again at any time.
- **Logout:** You can log out from the child list screen, which will clear the current session token.

## Code Structure

- **App.js:** Entry point of the application, handling navigation between screens and global state (authentication token and current selected child).
- **Screens:** The app is divided into multiple screens, located in `src/screens/`:
  - `LoginScreen.js` and `RegisterScreen.js` for user authentication.
  - `ChildListScreen.js` to display the user's children and options to add a new child or logout.
  - `AddChildScreen.js` for creating a new child profile.
  - `ChildDetailScreen.js` to show a specific child's recordings and global analysis summary.
  - `RecordScreen.js` for recording audio and uploading it for analysis.
  - `AnalysisScreen.js` to display the detailed results of a recording's analysis.
- **api.js:** Contains the base API URL configuration and a helper for authenticated fetch calls.

## Notes

- The application uses **Expo** for cross-platform compatibility. Ensure you have Expo CLI or a compatible environment to run the project.
- Audio recording on web is converted to WAV format in the browser for compatibility with the backend. On mobile, recordings are captured in MPEG-4 format and sent as WAV; the backend currently expects WAV files, so for full functionality on Android devices, additional conversion or backend support for other audio formats might be necessary. In testing, using the web app or an iOS device (which uses linear PCM encoding) is recommended for ensuring the backend accepts the audio.
- The authentication token expires after 30 minutes (as set by the backend). If your session expires, you will need to log in again.
- All network requests and features correspond to the provided FastAPI backend endpoints. No backend modifications are necessary to use this front-end.

