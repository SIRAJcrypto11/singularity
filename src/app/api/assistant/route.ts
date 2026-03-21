import { NextResponse } from 'next/server';
import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434/api/generate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await axios.post(OLLAMA_URL, {
      ...body,
      stream: false
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Ollama Proxy Error:', error.message);
    return NextResponse.json({ error: 'Failed to connect to Ollama' }, { status: 500 });
  }
}
