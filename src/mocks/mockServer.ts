import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import type { FollowUpQuestion } from '../services/api';

// Mock session storage
const sessions: Record<string, {
  patientData: any;
  currentQuestion: number;
  answers: string[];
}> = {};

// Mock follow-up questions
const mockQuestions: FollowUpQuestion[] = [
  {
    question: "Do you experience shortness of breath during physical activity?",
    options: [
      { key: "A", value: "Yes, even during light activity" },
      { key: "B", value: "Only during intense exercise" },
      { key: "C", value: "Rarely or never" },
      { key: "D", value: "Not sure" }
    ],
    status: "waiting_for_answer"
  },
  {
    question: "Have you noticed any changes in your skin color?",
    options: [
      { key: "A", value: "Yes, my skin appears paler than usual" },
      { key: "B", value: "Yes, I've noticed yellowing of the skin" },
      { key: "C", value: "No changes in skin color" },
      { key: "D", value: "Other changes (rashes, etc.)" }
    ],
    status: "waiting_for_answer"
  },
  {
    question: "How would you describe your energy levels throughout the day?",
    options: [
      { key: "A", value: "Consistently low energy" },
      { key: "B", value: "Energy drops significantly in the afternoon" },
      { key: "C", value: "Normal energy most of the day" },
      { key: "D", value: "Highly variable from day to day" }
    ],
    status: "waiting_for_answer"
  }
];

// Setup mock handlers
export const handlers = [
  // Handle POST /symptom endpoint
  http.post('http://127.0.0.1:8000/symptom', async ({ request }) => {
    const patientData = await request.json();
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    sessions[sessionId] = {
      patientData,
      currentQuestion: 0,
      answers: []
    };
    
    return HttpResponse.json({ session_id: sessionId });
  }),
  
  // Handle GET /generate_report endpoint
  http.get('http://127.0.0.1:8000/generate_report/:sessionId', ({ params }) => {
    const { sessionId } = params;
    
    if (!sessions[sessionId as string]) {
      return HttpResponse.json(
        { detail: "Session not found" },
        { status: 404 }
      );
    }
    
    // Create a simple PDF-like blob for testing
    const pdfData = new Blob(
      [`
        Medical Diagnosis Report
        ------------------------
        Patient: ${sessions[sessionId as string].patientData.name}
        Age: ${sessions[sessionId as string].patientData.age}
        Gender: ${sessions[sessionId as string].patientData.gender}
        
        Symptoms: ${sessions[sessionId as string].patientData.symptoms}
        
        Diagnosis: Based on the symptoms and follow-up questions, 
        the patient likely has Iron Deficiency Anemia.
        
        Recommendations: 
        - Further blood tests to confirm diagnosis
        - Iron supplements
        - Diet rich in iron (red meat, spinach, beans)
        - Follow-up with healthcare provider in 2 weeks
      `], 
      { type: 'application/pdf' }
    );
    
    return new HttpResponse(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diagnosis_${sessionId}.pdf"`
      }
    });
  })
];

// Create the worker
export const worker = setupWorker(...handlers);

// WebSocket mock
export class MockWebSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  sessionId: string;
  
  constructor(url: string) {
    super();
    this.url = url;
    this.sessionId = url.split('/').pop() || '';
    
    // Simulate connection delay
    setTimeout(() => {
      if (!sessions[this.sessionId]) {
        this.dispatchEvent(new Event('error'));
        this.readyState = MockWebSocket.CLOSED;
        return;
      }
      
      this.readyState = MockWebSocket.OPEN;
      this.dispatchEvent(new Event('open'));
      
      // Send first question
      this.sendNextQuestion();
    }, 500);
  }
  
  send(data: string) {
    const parsedData = JSON.parse(data);
    const sessionData = sessions[this.sessionId];
    
    if (!sessionData) return;
    
    // Store the answer
    sessionData.answers.push(parsedData.answer);
    sessionData.currentQuestion++;
    
    // Check if we have more questions
    if (sessionData.currentQuestion < mockQuestions.length) {
      setTimeout(() => this.sendNextQuestion(), 1000);
    } else {
      // Send completion status
      setTimeout(() => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            ...mockQuestions[0],
            question: "Diagnosis complete. Thank you for your responses.",
            options: [],
            status: "completed"
          })
        });
        this.dispatchEvent(event);
      }, 1500);
    }
  }
  
  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.dispatchEvent(new Event('close'));
  }
  
  private sendNextQuestion() {
    const sessionData = sessions[this.sessionId];
    if (!sessionData) return;
    
    const questionIndex = sessionData.currentQuestion;
    const question = mockQuestions[questionIndex];
    
    if (question) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(question)
      });
      this.dispatchEvent(event);
    }
  }
}

// Initialize the mock server
export const initMockServer = () => {
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MOCK === 'true') {
    console.log('Starting mock server...');
    
    // Replace the WebSocket constructor
    globalThis.WebSocket = MockWebSocket as any;
    
    // Start the service worker for HTTP mocking
    worker.start({
      onUnhandledRequest: 'bypass' // Don't warn about unhandled requests
    });
    
    return true;
  }
  return false;
}; 