# Voice Clone TS

## Overview

**Voice Clone TS** is a Next.js application designed for recording and cloning voice samples using TypeScript, React, and Tailwind CSS. The application leverages the ElevenLabs API for voice cloning, allowing users to create a digital replica of their voice based on recorded samples. This project aims to provide a user-friendly interface for voice recording, cloning, and playback.

## Features

- **Voice Recording**: Users can record their voice using the microphone with real-time feedback on the recording status.
- **Voice Cloning**: After recording, users can upload their voice samples to clone their voice using the ElevenLabs API.
- **Playback**: A playback feature is available to listen to original recordings and cloned voice samples.
- **Responsive Design**: The application is built with Tailwind CSS, ensuring a modern and responsive user interface.

## How It Works

1. **Recording**:

   - Users can start recording their voice by clicking a button. The application utilizes the MediaRecorder API to capture audio from the user's microphone.
   - The recording status is displayed to the user, including a countdown timer and visual feedback.

2. **Cloning**:

   - Once the recording is complete, users can select the recorded audio file and provide a name for the voice clone.
   - The application sends the audio file to the ElevenLabs API for processing, which returns a cloned voice sample.

3. **Playback**:
   - Users can navigate to the playback page to listen to their original recordings and the cloned voice samples.
   - The playback feature is currently in development and will be enhanced in future updates.

## Current Development Status

As of now, the application is in the following state:

- **Completed Features**:

  - Voice recording functionality is fully implemented and tested.
  - Basic voice cloning functionality is operational, with integration to the ElevenLabs API.
  - The user interface is responsive and styled using Tailwind CSS.

- **In Progress**:

  - The playback feature is currently a placeholder and needs further development to allow users to listen to their recordings and cloned voices.
  - Additional error handling and user feedback mechanisms are planned to improve the user experience.

- **Future Enhancements**:
  - Implement user authentication to save recordings and cloned voices.
  - Add more customization options for voice cloning.
  - Improve accessibility features to ensure usability for all users.

## Getting Started

To run the application locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/kcwolff/VoiceCloneTS.git
cd VoiceCloneTS
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root of the project and add your ElevenLabs API key:

```
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## License

This project is licensed under the MIT License.

---
