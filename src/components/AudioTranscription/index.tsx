import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Mic, Upload, FileAudio, Loader } from 'lucide-react';
import { createClient } from '@deepgram/sdk';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

interface TranscriptionResult {
  text: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export const AudioTranscription: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0];
    if (audioFile) {
      setFile(audioFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select an audio file first');
      return;
    }

    if (!DEEPGRAM_API_KEY) {
      setError('Deepgram API key is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const deepgram = createClient(DEEPGRAM_API_KEY);
      const audioData = await file.arrayBuffer();

      const response = await deepgram.transcription.preRecorded({
        buffer: audioData,
        mimetype: file.type
      }, {
        smart_format: true,
        model: 'general',
        language: 'en-US',
        punctuate: true,
        utterances: true,
        diarize: true
      });

      const result = response.results?.channels[0]?.alternatives[0];
      
      if (result) {
        setTranscription({
          text: result.transcript,
          confidence: result.confidence,
          words: result.words || []
        });
      } else {
        throw new Error('No transcription results found');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Mic className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Audio Transcription</h2>
          </div>
          <p className="mt-2 text-gray-600">
            Upload an audio or video file to transcribe it using Deepgram's AI
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200 ease-in-out
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Drag and drop your audio file here'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              or click to select a file from your computer
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supported formats: MP3, WAV, M4A, FLAC, OGG, MP4, WebM, MOV
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileAudio className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleTranscribe}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Transcribing...</span>
                  </div>
                ) : (
                  'Transcribe'
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {transcription && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Transcription
                  <span className="ml-2 text-sm text-gray-500">
                    ({(transcription.confidence * 100).toFixed(1)}% confidence)
                  </span>
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {transcription.text}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Word-by-Word Analysis
                </h3>
                <div className="space-y-2">
                  {transcription.words.map((word, index) => (
                    <div
                      key={index}
                      className="inline-block m-1 px-2 py-1 bg-white rounded border border-gray-200"
                      title={`Confidence: ${(word.confidence * 100).toFixed(1)}%`}
                    >
                      <span className="text-sm">{word.word}</span>
                      <span className="ml-1 text-xs text-gray-500">
                        {word.start.toFixed(2)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};