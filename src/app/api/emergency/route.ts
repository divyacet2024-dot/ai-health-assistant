import { NextRequest, NextResponse } from 'next/server';

// Mock hospitals data
const HOSPITALS = [
  { id: 'h1', name: 'City General Hospital', distance: 2.5, eta: 8, beds: 5, emergency: true },
  { id: 'h2', name: 'Medicare Center', distance: 4.2, eta: 15, beds: 2, emergency: true },
  { id: 'h3', name: 'LifeCare Emergency', distance: 6.1, eta: 22, beds: 8, emergency: true },
  { id: 'h4', name: 'University Medical Center', distance: 8.5, eta: 28, beds: 12, emergency: true },
];

// Mock ambulance data
const AMBULANCES = [
  { id: 'amb-001', status: 'en-route', eta: 6, location: 'Main Street' },
  { id: 'amb-002', status: 'available', eta: 4, location: 'Station Alpha' },
  { id: 'amb-003', status: 'en-route', eta: 9, location: 'Highway Junction' },
];

// First aid guidance
const FIRST_AID_GUIDANCE = {
  'chest-pain': {
    title: 'Chest Pain / Heart Attack Signs',
    steps: [
      'Call emergency services immediately (108 or local ambulance)',
      'Have the person sit or lie down in a comfortable position',
      'Loosen any tight clothing',
      'If person has aspirin (not allergic), have them chew one regular aspirin',
      'Stay calm and reassure the person until help arrives',
      'If person becomes unconscious, begin CPR if trained',
    ],
  },
  'breathing': {
    title: 'Difficulty Breathing',
    steps: [
      'Help the person sit upright or in a position of comfort',
      'Loosen tight clothing',
      'If available, give any prescribed inhaler',
      'Keep the person calm and do not let them exert themselves',
      'Call emergency services immediately',
      'Monitor breathing until help arrives',
    ],
  },
  'unconscious': {
    title: 'Unconscious / Unresponsive',
    steps: [
      'Check for responsiveness by tapping and shouting',
      'Call emergency services immediately',
      'Place person on their back',
      'Check breathing - if not breathing, begin CPR',
      'Place person in recovery position if breathing',
      'Stay with them until help arrives',
    ],
  },
  'severe-bleeding': {
    title: 'Severe Bleeding',
    steps: [
      'Apply direct pressure with clean cloth',
      'Elevate the injured area above heart level if possible',
      'Do not remove the cloth even if it soaks through',
      'Call emergency services immediately',
      'Keep person warm and calm',
      'Monitor for signs of shock',
    ],
  },
  'default': {
    title: 'General Emergency',
    steps: [
      'Stay calm and assess the situation',
      'Call emergency services (108) immediately',
      'Do not move the person unless necessary for safety',
      'Keep the person comfortable',
      'Monitor breathing and consciousness',
      'Stay with them until professional help arrives',
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, patientCondition, hospitalId } = body;

    // Activate emergency mode
    if (action === 'activate') {
      const nearestHospital = HOSPITALS.sort((a, b) => a.eta - b.eta)[0];
      const availableAmbulance = AMBULANCES.find(a => a.status === 'available') || AMBULANCES[0];

      return NextResponse.json({
        success: true,
        data: {
          emergencyActivated: true,
          timestamp: new Date().toISOString(),
          hospital: nearestHospital,
          ambulance: {
            ...availableAmbulance,
            estimatedArrival: availableAmbulance.eta,
          },
          trafficCleared: false,
          nearbyAlert: false,
          simulation: true,
          message: 'Emergency mode activated (SIMULATION MODE)',
        },
      });
    }

    // Optimize route
    if (action === 'optimize-route') {
      // Simulate traffic optimization
      const originalEta = 12;
      const optimizedEta = 7;
      const savedTime = originalEta - optimizedEta;

      return NextResponse.json({
        success: true,
        data: {
          originalRoute: { eta: originalEta, distance: '5.2 km', trafficHeavy: true },
          optimizedRoute: { eta: optimizedEta, distance: '6.8 km', trafficHeavy: false },
          signalsCleared: true,
          routeHighlighted: true,
          improvement: `${savedTime} minutes saved`,
          simulation: true,
          message: 'Route optimized (SIMULATION - no real traffic control)',
        },
      });
    }

    // Get hospital suggestions
    if (action === 'suggest-hospitals') {
      const currentHospital = hospitalId 
        ? HOSPITALS.find(h => h.id === hospitalId)
        : HOSPITALS[0];
      
      // Find hospitals with shorter ETA
      const betterHospitals = HOSPITALS
        .filter(h => h.eta < (currentHospital?.eta || 15) && h.id !== hospitalId)
        .slice(0, 3);

      return NextResponse.json({
        success: true,
        data: {
          currentHospital,
          suggestions: betterHospitals,
          simulation: true,
          message: betterHospitals.length > 0 
            ? 'Alternative hospitals found' 
            : 'Current hospital is optimal',
        },
      });
    }

    // Send crowd alert (simulated)
    if (action === 'crowd-alert') {
      return NextResponse.json({
        success: true,
        data: {
          alertSent: true,
          radius: '1 km',
          simulatedUsersNotified: 12,
          message: 'Alert sent to nearby users (DEMO SIMULATION - no real notifications)',
          simulation: true,
        },
      });
    }

    // Get first aid guidance
    if (action === 'first-aid') {
      const condition = patientCondition || 'default';
      const guidance = FIRST_AID_GUIDANCE[condition] || FIRST_AID_GUIDANCE.default;

      return NextResponse.json({
        success: true,
        data: {
          ...guidance,
          simulation: true,
          disclaimer: 'For guidance only. Contact medical professionals immediately.',
        },
      });
    }

    // Getambo services
    if (action === 'emergency-options') {
      return NextResponse.json({
        success: true,
        data: {
          groundAmbulance: { type: 'Ground Ambulance', eta: 6, simulated: true },
          airAmbulance: { type: 'Air Ambulance', eta: 15, simulated: true },
          nearbyEmergency: { type: 'Nearest Emergency Unit', eta: 4, simulated: true },
          emergencyHotline: '108 (India Emergency)',
          simulation: true,
          message: 'All options are simulated for demonstration',
        },
      });
    }

    // Default: return status
    return NextResponse.json({
      success: true,
      data: {
        hospitals: HOSPITALS,
        ambulances: AMBULANCES,
        simulation: true,
        message: 'Emergency system ready (DEMO MODE)',
      },
    });
  } catch (error: any) {
    console.error('Emergency API Error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Emergency service error' },
      { status: 500 }
    );
  }
}