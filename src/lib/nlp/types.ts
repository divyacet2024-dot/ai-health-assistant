/**
 * Lightweight NLP layer — intent + entities without extra ML deps.
 * Makes replies feel contextual by summarizing what was understood.
 */

export type NLPIntent =
  | 'emergency'
  | 'caretaker_call'
  | 'appointment'
  | 'symptom_check'
  | 'medicine_info'
  | 'lab_report'
  | 'general_health'
  | 'education_query'
  | 'conversation';

export interface NLPAnalysis {
  primaryIntent: NLPIntent;
  confidence: number;
  entities: {
    symptoms: string[];
    medications: string[];
    bodyParts: string[];
    durations: string[];
    /** Cities / regions mentioned in free text */
    locationsInText: string[];
    severityCue?: 'low' | 'moderate' | 'high';
  };
}
