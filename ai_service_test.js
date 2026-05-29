import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.05'], 
    },
    stages: [
        { duration: '1m', target: 2 },   // Light initial traffic
        { duration: '4m', target: 10 },  // Safe maximum limit for local AI generation
        { duration: '1m', target: 0 },   // Cool down
    ],
};

const AI_SERVICE_URL = __ENV.AI_SERVICE_URL || 'http://localhost:8000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'YOUR_LONG_LIVED_TEST_JWT_TOKEN'; // Replace with valid token or set via env 

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        timeout: '120s', // 2-minute allowance for video rendering
    };

    const aiPayload = JSON.stringify({ 
        topic: 'Asynchronous Load Testing', 
        duration: 'short' 
    });

    let aiRes = http.post(`${AI_SERVICE_URL}/api/lessons/generate`, aiPayload, params);
    
    check(aiRes, {
        'AI Generation processed or queued': (r) => r.status === 200 || r.status === 202,
    });

    sleep(10); 
}