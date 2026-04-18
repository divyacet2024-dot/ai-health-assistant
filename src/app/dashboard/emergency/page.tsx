'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Siren, MapPin, Clock, Heart, Hospital,
  Users, AlertTriangle, Shield, Zap,
  ChevronRight, CheckCircle, XCircle, Info,
  Phone, Car, Plane, Search,
  Loader2, Activity, Bell, FileText,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

type EmergencyStatus = 'inactive' | 'active' | 'optimized';

interface Hospital {
  id: string;
  name: string;
  distance: number;
  eta: number;
  beds: number;
  emergency: boolean;
}

interface Ambulance {
  id: string;
  status: string;
  eta: number;
  location: string;
}

interface FirstAidGuide {
  title: string;
  steps: string[];
}

export default function EmergencyPage() {
  const [status, setStatus] = useState<EmergencyStatus>('inactive');
  const [loading, setLoading] = useState(false);
  const [patientCondition, setPatientCondition] = useState('default');
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [crowdAlert, setCrowdAlert] = useState(false);
  const [firstAid, setFirstAid] = useState<FirstAidGuide | null>(null);
  const [hospitalSuggestions, setHospitalSuggestions] = useState<Hospital[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  async function activateEmergency() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('active');
        setHospital(data.data.hospital);
        setAmbulance(data.data.ambulance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function optimizeRoute() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimize-route' }),
      });
      const data = await res.json();
      if (data.success) {
        setRouteOptimized(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function sendCrowdAlert() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'crowd-alert' }),
      });
      const data = await res.json();
      if (data.success) {
        setCrowdAlert(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function getFirstAid() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'first-aid', patientCondition }),
      });
      const data = await res.json();
      if (data.success) {
        setFirstAid(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function suggestHospitals() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest-hospitals', hospitalId: hospital?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setHospitalSuggestions(data.data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function getEmergencyOptions() {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emergency-options' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowOptions(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStatus('inactive');
    setHospital(null);
    setAmbulance(null);
    setRouteOptimized(false);
    setCrowdAlert(false);
    setFirstAid(null);
    setHospitalSuggestions([]);
    setShowOptions(false);
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-muted transition">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <Siren className="w-6 h-6 text-destructive" />
                Emergency Response
              </h1>
              <p className="text-sm text-muted-foreground">
                AI Emergency Response System (Demo)
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Simulation Disclaimer */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Simulation Mode</p>
              <p className="text-sm text-destructive/80 mt-1">
                This is a <strong>SIMULATED</strong> demonstration for startup demo purposes only.
                This system does not replace professional emergency services. 
                In real emergency, call <strong>108</strong> immediately.
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'inactive' ? (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border-2 border-dashed border-destructive/30 rounded-2xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <Siren className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">Activate Emergency Mode</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Simulate a critical patient scenario with AI-powered route optimization, 
                hospital suggestions, and first aid guidance.
              </p>
              <button
                onClick={activateEmergency}
                disabled={loading}
                className="inline-flex items-center gap-3 px-8 py-4 bg-destructive text-white rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-destructive/25"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Activate Emergency Mode
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Patient Condition Selector */}
              <div className="grid sm:grid-cols-4 gap-3">
                {[
                  { key: 'chest-pain', label: 'Chest Pain', icon: Heart },
                  { key: 'breathing', label: 'Breathing Issue', icon: Activity },
                  { key: 'unconscious', label: 'Unconscious', icon: XCircle },
                  { key: 'severe-bleeding', label: 'Severe Bleeding', icon: AlertTriangle },
                ].map((cond) => (
                  <button
                    key={cond.key}
                    onClick={() => { setPatientCondition(cond.key); setFirstAid(null); }}
                    className={cn(
                      'p-4 rounded-xl border text-left transition',
                      patientCondition === cond.key 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    <cond.icon className="w-5 h-5 mb-2 text-destructive" />
                    <p className="font-medium text-sm">{cond.label}</p>
                  </button>
                ))}
              </div>

              {/* Main Status Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Patient Status */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-destructive animate-pulse" />
                    <h3 className="font-semibold">Patient Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium text-destructive capitalize">{patientCondition.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-chart-5">Critical</span>
                    </div>
                  </div>
                </div>

                {/* Ambulance Status */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-chart-1" />
                    <h3 className="font-semibold">Ambulance</h3>
                  </div>
                  {ambulance && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-medium">{ambulance.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ETA</span>
                        <span className="font-medium">{ambulance.eta} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{ambulance.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hospital Status */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Hospital className="w-5 h-5 text-chart-2" />
                    <h3 className="font-semibold">Hospital</h3>
                  </div>
                  {hospital && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-xs">{hospital.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ETA</span>
                        <span className="font-medium">{hospital.eta} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Beds</span>
                        <span className="font-medium">{hospital.beds} available</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={optimizeRoute}
                  disabled={loading || routeOptimized}
                  className={cn(
                    'p-4 rounded-xl border text-left transition',
                    routeOptimized 
                      ? 'border-chart-3 bg-chart-3/10' 
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <MapPin className={cn('w-5 mb-2', routeOptimized ? 'text-chart-3' : 'text-chart-1')} />
                  <p className="font-medium">Optimize Route</p>
                  <p className="text-xs text-muted-foreground">Reduce ETA</p>
                </button>

                <button
                  onClick={sendCrowdAlert}
                  disabled={loading || crowdAlert}
                  className={cn(
                    'p-4 rounded-xl border text-left transition',
                    crowdAlert 
                      ? 'border-chart-3 bg-chart-3/10' 
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Bell className={cn('w-5 mb-2', crowdAlert ? 'text-chart-3' : 'text-chart-4')} />
                  <p className="font-medium">Crowd Alert</p>
                  <p className="text-xs text-muted-foreground">Notify nearby</p>
                </button>

                <button
                  onClick={suggestHospitals}
                  disabled={loading}
                  className="p-4 rounded-xl border border-border hover:bg-muted transition"
                >
                  <Hospital className="w-5 mb-2 text-chart-2" />
                  <p className="font-medium">Switch Hospital</p>
                  <p className="text-xs text-muted-foreground">Better option</p>
                </button>

                <button
                  onClick={getFirstAid}
                  disabled={loading}
                  className="p-4 rounded-xl border border-border hover:bg-muted transition"
                >
                  <FileText className="w-5 mb-2 text-destructive" />
                  <p className="font-medium">First Aid Guide</p>
                  <p className="text-xs text-muted-foreground">Step by step</p>
                </button>
              </div>

              {/* Route Optimized */}
              {routeOptimized && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-chart-3/10 border border-chart-3/30 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-chart-3" />
                    <h3 className="font-semibold text-chart-3">Route Optimized</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Original Route</p>
                      <p className="font-bold text-destructive">12 min • 5.2 km</p>
                      <p className="text-xs text-destructive/70">Heavy traffic</p>
                    </div>
                    <div className="bg-chart-3/20 rounded-xl p-4">
                      <p className="text-xs text-chart-3 mb-1">Optimized Route</p>
                      <p className="font-bold text-chart-3">7 min • 6.8 km</p>
                      <p className="text-xs text-chart-3/70">Traffic cleared</p>
                    </div>
                  </div>
                  <p className="text-xs text-chart-3 mt-3">
                    ✓ Signals cleared ahead (SIMULATION - no real traffic control)
                  </p>
                </motion.div>
              )}

              {/* Crowd Alert */}
              {crowdAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-chart-3/10 border border-chart-3/30 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-chart-3" />
                    <h3 className="font-semibold text-chart-3">Alert Sent</h3>
                  </div>
                  <p className="text-sm">
                    Alert sent to <strong>12 users</strong> within 1 km radius
                  </p>
                  <p className="text-xs text-chart-3 mt-2">
                    (DEMO SIMULATION - no real notifications sent)
                  </p>
                </motion.div>
              )}

              {/* Hospital Suggestions */}
              {hospitalSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <h3 className="font-semibold mb-4">Alternative Hospitals (Faster)</h3>
                  <div className="space-y-3">
                    {hospitalSuggestions.map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                        <div>
                          <p className="font-medium">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.distance} km • {h.beds} beds</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-chart-3">{h.eta} min</p>
                          <p className="text-xs text-chart-3/70">saved 5 min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* First Aid Guide */}
              {firstAid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5"
                >
                  <h3 className="font-semibold mb-4 text-destructive">{firstAid.title}</h3>
                  <ol className="space-y-3">
                    {firstAid.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-destructive text-white text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-destructive mt-4 pt-4 border-t border-destructive/20">
                    <strong>Disclaimer:</strong> {firstAid.disclaimer}
                  </p>
                </motion.div>
              )}

              {/* Backup Options */}
              <button
                onClick={getEmergencyOptions}
                disabled={loading}
                className="w-full p-5 border border-border rounded-2xl hover:bg-muted transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Backup Emergency Options</p>
                    <p className="text-sm text-muted-foreground">Air ambulance, emergency units</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    <Phone className="w-5 h-5" />
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Emergency Hotline */}
              <div className="bg-destructive rounded-2xl p-6 text-center text-white">
                <p className="text-sm opacity-80 mb-2">In real emergency, call</p>
                <p className="text-3xl font-bold">108</p>
                <p className="text-sm opacity-80 mt-2">India Emergency Services</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Disclaimer */}
        <div className="bg-muted/50 rounded-xl p-4 text-xs text-center text-muted-foreground">
          <strong>Disclaimer:</strong> This system supports emergency awareness but does NOT replace 
          professional medical or emergency services. Always contact local emergency services (108) in real emergencies.
          This is a simulation for demonstration purposes only.
        </div>
      </div>
    </AppShell>
  );
}