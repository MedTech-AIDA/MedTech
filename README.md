# Sehat - AI-Powered Medical Diagnosis System

Sehat is a modern web application that provides AI-powered medical diagnosis through an interactive chat interface. The system analyzes patient symptoms, asks relevant follow-up questions, and generates comprehensive medical reports.

## Features

- 🤖 AI-powered symptom analysis and diagnosis
- 💬 Interactive chat interface for follow-up questions
- 📊 Real-time diagnostic reasoning visualization
- 📝 Comprehensive medical reports in PDF format
- 🔒 Secure WebSocket communication
- 📱 Responsive design for all devices
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **API Communication**: WebSocket, Axios
- **Deployment**: Render

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sehat.git
cd sehat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://medical-diagnosis-smwn.onrender.com
VITE_WS_BASE_URL=wss://medical-diagnosis-smwn.onrender.com
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
sehat/
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Usage

1. **Patient Information**
   - Enter patient details and initial symptoms
   - Submit to start the diagnosis process

2. **Diagnosis Chat**
   - Answer follow-up questions from the AI
   - View real-time analysis of your responses
   - Get immediate feedback on symptom relevance

3. **Diagnosis Report**
   - View comprehensive diagnosis results
   - Download detailed PDF report
   - Access diagnostic reasoning
   - Share report with healthcare providers

## API Integration

The application integrates with a medical diagnosis API that provides:
- Symptom analysis
- Follow-up questions
- Diagnosis generation
- Report generation

API Endpoints:
- `POST /submit_patient`: Submit patient information
- `GET /session/{session_id}`: Get session data
- `WebSocket /followup/{session_id}`: Real-time follow-up questions
- `GET /generate_report/{session_id}`: Generate diagnosis report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@sehat.com or open an issue in the GitHub repository.

## Acknowledgments

- Medical diagnosis API provided by [API Provider]
- Icons from Material Icons
- UI components styled with Tailwind CSS
