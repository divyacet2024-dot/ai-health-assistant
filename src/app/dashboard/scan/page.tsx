'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Upload, Scan, Loader2, AlertTriangle,
  Pill, FlaskConical, Clock, Shield, AlertCircle,
  Info, ChevronLeft, X, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

interface ScanResult {
  medicineName: string;
  type: string;
  mainUse: string;
  howItWorks: string;
  dosage: string;
  whenToTake: string;
  sideEffects: string[];
  warnings: string[];
  expiry: string;
  safetyAdvice: string;
  confidence: string;
  note?: string;
  error?: string;
}

const DEFAULT_RESULT: ScanResult = {
  medicineName: '',
  type: '',
  mainUse: '',
  howItWorks: '',
  dosage: '',
  whenToTake: '',
  sideEffects: [],
  warnings: [],
  expiry: '',
  safetyAdvice: '',
  confidence: 'high',
};

function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = ev.target?.result as string;
      setImage(img);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to scan image');
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError('Failed to scan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const confidenceColor = {
    high: 'text-chart-3',
    medium: 'text-chart-5',
    low: 'text-destructive',
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-muted transition">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Camera className="w-6 h-6 text-primary" />
              Smart Medicine Scanner
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload a medicine image to get AI-powered information
            </p>
          </div>
        </motion.div>

        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload Medicine Image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take a clear photo of the medicine strip, blister pack, or bottle
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports JPG, PNG • Max 10MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="relative aspect-video max-h-64 bg-muted rounded-xl overflow-hidden mx-auto">
                  <img
                    src={image}
                    alt="Medicine preview"
                    className="object-contain w-full h-full"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}

              {/* Scan Button */}
              {!result && (
                <button
                  onClick={handleScan}
                  disabled={loading}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition',
                    'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing medicine...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      Scan Medicine
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Confidence Badge */}
                  {result.confidence !== 'high' && (
                    <div className={cn(
                      'flex items-center gap-2 p-3 rounded-xl text-sm font-medium',
                      result.confidence === 'low' 
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-chart-5/10 text-chart-5'
                    )}>
                      <AlertTriangle className="w-4 h-4" />
                      {result.confidence === 'low' 
                        ? 'Low confidence - please verify with a doctor'
                        : 'Medium confidence - verify details before use'
                      }
                    </div>
                  )}

                  {/* Main Info Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-primary">
                          {result.medicineName || 'Unknown Medicine'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          {result.type && (
                            <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              {result.type}
                            </span>
                          )}
                          <span className={cn('text-sm font-medium', confidenceColor[result.confidence as keyof typeof confidenceColor] || 'text-muted-foreground')}>
                            {result.confidence === 'high' ? 'High confidence' : `${result.confidence} confidence`}
                          </span>
                        </div>
                      </div>
                      <Pill className="w-10 h-10 text-primary/50" />
                    </div>

                    {result.mainUse && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Main Use:</span> {result.mainUse}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* How it Works */}
                  {result.howItWorks && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-chart-3" />
                        How it Works
                      </h3>
                      <p className="text-sm text-muted-foreground">{result.howItWorks}</p>
                    </div>
                  )}

                  {/* Dosage & Timing */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.dosage && (
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <FlaskConical className="w-4 h-4 text-chart-1" />
                          Dosage
                        </h3>
                        <p className="text-sm text-muted-foreground">{result.dosage}</p>
                      </div>
                    )}
                    {result.whenToTake && (
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-chart-2" />
                          When to Take
                        </h3>
                        <p className="text-sm text-muted-foreground">{result.whenToTake}</p>
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
                      <h3 className="font-semibold flex items-center gap-2 mb-3 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        Warnings
                      </h3>
                      <ul className="space-y-2">
                        {result.warnings.map((warning, i) => (
                          <li key={i} className="text-sm text-destructive/80 flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Side Effects */}
                  {result.sideEffects && result.sideEffects.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold flex items-center gap-2 mb-3 text-chart-5">
                        <AlertCircle className="w-4 h-4" />
                        Possible Side Effects
                      </h3>
                      <ul className="flex flex-wrap gap-2">
                        {result.sideEffects.map((effect, i) => (
                          <li key={i} className="text-sm bg-chart-5/10 text-chart-5 px-3 py-1 rounded-full">
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expiry */}
                  {result.expiry && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-chart-4" />
                        Expiry
                      </h3>
                      <p className="text-lg font-semibold">{result.expiry}</p>
                    </div>
                  )}

                  {/* Safety Advice */}
                  <div className="bg-chart-3/10 border border-chart-3/30 rounded-2xl p-5">
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-chart-3">
                      <Shield className="w-4 h-4" />
                      Safety Advice
                    </h3>
                    <p className="text-sm text-chart-3">{result.safetyAdvice}</p>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground text-center">
                    <strong>Disclaimer:</strong> This is AI-generated information for reference only. 
                    Always consult a qualified doctor or pharmacist before taking any medicine. 
                    The AI may not always be accurate.
                  </div>

                  {/* Note (if API key not configured) */}
                  {result.note && (
                    <div className="bg-chart-5/10 border border-chart-5/30 rounded-xl p-3 text-xs text-chart-5">
                      {result.note}
                    </div>
                  )}

                  {/* Scan Another */}
                  <button
                    onClick={handleReset}
                    className="w-full py-3 border border-border rounded-xl font-semibold hover:bg-muted transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Another Medicine
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

export default ScannerPage;