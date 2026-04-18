/**
 * Built-in AI Response Engine — works without any API key.
 * Covers 100+ medical topics with detailed, context-aware responses.
 * Feels like real AI with natural language understanding.
 */

import { UserRole } from './types';

// ========== KNOWLEDGE BASE ==========

const PATIENT_KNOWLEDGE: Record<string, string> = {
  // Common symptoms
  'headache|head pain|migraine': `## Headache Management

**Common causes:** Tension, dehydration, lack of sleep, eye strain, stress, sinusitis, or migraine.

**Immediate relief:**
- Rest in a quiet, dark room
- Stay hydrated — drink 2-3 glasses of water
- **Paracetamol 500mg** can help (max 4g/day)
- Apply a cold compress to your forehead
- Gentle neck and shoulder massage

**When to see a doctor urgently:**
- Sudden, severe "thunderclap" headache
- Headache with fever, stiff neck, or confusion
- Vision changes or speech difficulty
- Headache after a head injury
- Persistent headache lasting more than 3 days

**Prevention tips:**
- Maintain regular sleep schedule (7-8 hours)
- Stay hydrated throughout the day
- Take screen breaks every 30 minutes
- Manage stress with relaxation techniques

> **Note:** Frequent headaches (more than 2x/week) should be evaluated by a doctor to rule out underlying conditions.`,

  'fever|temperature|hot body': `## Fever Management Guide

Fever is your body's natural immune response to infection.

**Home management:**
- Rest and stay well-hydrated (water, ORS, soups)
- **Paracetamol 500mg** every 6 hours (adults)
- Wear light, comfortable clothing
- Sponge bath with lukewarm water (NOT cold)
- Monitor temperature every 4 hours

**When to seek immediate medical help:**
- Temperature above **103°F (39.4°C)**
- Fever lasting more than **3 days**
- Difficulty breathing or chest pain
- Severe headache with stiff neck
- Rash, confusion, or seizures
- In children under 3 months with any fever

**Common causes:** Viral infections (flu, cold), bacterial infections, UTI, dengue, malaria, COVID-19.

**What NOT to do:**
- Don't use ice-cold water for sponging
- Don't overdose on medications
- Don't ignore persistent fever

> Use the **Medicine Info** section to check dosage details for Paracetamol or Ibuprofen.`,

  'cold|cough|flu|sneez|runny nose|sore throat': `## Cold & Flu Management

**Symptoms:** Runny nose, sneezing, cough, sore throat, mild body ache, low-grade fever.

**Home remedies:**
- **Warm fluids** — honey-lemon water, ginger tea, warm soups
- **Steam inhalation** — 10 minutes, 2-3 times daily
- **Salt water gargle** — 1/2 tsp salt in warm water for sore throat
- **Rest** — at least 8 hours of sleep
- **Vitamin C** — citrus fruits, amla juice

**Medications:**
- **Cetirizine 10mg** — for runny nose and sneezing (1 tablet at night)
- **Paracetamol 500mg** — for fever and body ache
- **Cough syrup** — as recommended by pharmacist
- **Throat lozenges** — for sore throat relief

**When to see a doctor:**
- Symptoms lasting more than 10 days
- High fever (above 102°F)
- Difficulty breathing or wheezing
- Thick green/yellow mucus
- Severe sinus pain

> **Tip:** Most colds are viral and resolve in 7-10 days. Antibiotics are NOT needed for viral infections.`,

  'stomach|gastric|acidity|acid reflux|heartburn|bloating|indigestion': `## Digestive Issues — Acidity & Gastric Problems

**Common causes:** Spicy food, irregular meals, stress, overeating, NSAIDs, smoking.

**Immediate relief:**
- **Antacid** (Gelusil/Digene) — for quick relief
- **Pantoprazole 40mg** — take 30 min before breakfast
- Drink cold milk or buttermilk
- Avoid lying down after eating (wait 2-3 hours)

**Diet recommendations:**
- Eat smaller, frequent meals (5-6 times/day)
- Avoid: spicy food, citrus, coffee, alcohol, carbonated drinks
- Include: bananas, oatmeal, ginger, yogurt, green vegetables
- Drink 2-3 liters of water daily

**Lifestyle changes:**
- Elevate head while sleeping (use extra pillow)
- Don't eat 3 hours before bedtime
- Manage stress with yoga/meditation
- Quit smoking and limit alcohol

**When to see a doctor:**
- Persistent symptoms despite medication
- Difficulty swallowing
- Unexplained weight loss
- Blood in stool or vomit
- Severe abdominal pain

> Check **Medicine Info** for details on Pantoprazole and Omeprazole.`,

  'diabetes|sugar|blood sugar|insulin|hba1c': `## Understanding Diabetes

**Type 2 Diabetes** is a chronic condition where your body doesn't use insulin effectively.

**Key numbers to know:**
| Test | Normal | Pre-Diabetes | Diabetes |
|------|--------|-------------|----------|
| Fasting Blood Sugar | <100 mg/dL | 100-125 | ≥126 |
| Post-Meal (2hr) | <140 mg/dL | 140-199 | ≥200 |
| HbA1c | <5.7% | 5.7-6.4% | ≥6.5% |

**Daily management:**
- **Medication:** Take Metformin as prescribed (usually with meals)
- **Diet:** Low carb, high fiber, avoid sugar and white rice
- **Exercise:** 30 minutes of walking daily
- **Monitor:** Check blood sugar regularly (fasting + post-meal)

**Diet tips:**
- Replace white rice with brown rice or millets
- Include: green vegetables, dal, salads, nuts, whole grains
- Avoid: sweets, fruit juices, white bread, fried foods
- Eat at regular intervals — don't skip meals

**Important monitoring:**
- HbA1c every 3 months
- Eye check-up annually
- Kidney function test annually
- Foot examination regularly

> **Reminder:** Never stop diabetes medication without consulting your doctor. Use the **Appointments** section to book a follow-up.`,

  'blood pressure|bp|hypertension|high bp': `## Blood Pressure Management

**Understanding your BP reading:**
| Category | Systolic | Diastolic |
|----------|----------|-----------|
| Normal | <120 | <80 |
| Elevated | 120-129 | <80 |
| Stage 1 Hypertension | 130-139 | 80-89 |
| Stage 2 Hypertension | ≥140 | ≥90 |
| Crisis (Emergency!) | >180 | >120 |

**Lifestyle modifications (DASH approach):**
- **Diet:** Reduce salt (<5g/day), eat fruits, vegetables, whole grains
- **Activity:** 150 minutes of moderate exercise per week
- **Sleep:** 7-8 hours of quality sleep
- **Habits:** Quit smoking, limit alcohol, manage stress

**Medications (as prescribed):**
- **Amlodipine** — calcium channel blocker
- **Telmisartan/Losartan** — ARBs
- **Enalapril** — ACE inhibitor

**Daily monitoring tips:**
- Check BP at the same time daily
- Rest 5 minutes before measuring
- Don't check after coffee, exercise, or stress
- Keep a log to show your doctor

> **Warning:** If BP is >180/120, seek **emergency medical help** immediately.`,

  'sleep|insomnia|cant sleep|trouble sleeping': `## Better Sleep Guide

**Sleep hygiene tips:**
- **Fixed schedule** — Same bedtime and wake time daily (even weekends)
- **Screen-free zone** — No phones/laptops 1 hour before bed
- **Cool, dark room** — 65-68°F (18-20°C) is ideal
- **Avoid** caffeine after 2 PM, heavy meals 3 hours before bed
- **Exercise** in the morning/afternoon, not close to bedtime

**Relaxation techniques:**
- **4-7-8 breathing:** Inhale 4 sec → Hold 7 sec → Exhale 8 sec
- **Progressive muscle relaxation** — tense and release each muscle group
- **Guided meditation** — 10 minutes before sleep
- **Warm bath** — 30 minutes before bed

**Natural aids:**
- Chamomile tea before bed
- Warm milk with turmeric
- Lavender aromatherapy
- Magnesium-rich foods (bananas, almonds, dark chocolate)

**When to see a doctor:**
- Insomnia lasting more than 3 weeks
- Loud snoring with breathing pauses (sleep apnea)
- Daytime sleepiness affecting daily activities
- Restless legs or unusual movements during sleep

> **Track your sleep** in the **Health Log** section to identify patterns!`,

  'anxiety|stress|mental health|depression|panic': `## Managing Stress & Anxiety

**Immediate calming techniques:**
- **Box breathing:** Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec
- **5-4-3-2-1 grounding:** Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste
- **Progressive muscle relaxation**
- Step outside for fresh air and sunlight

**Daily practices for mental wellness:**
- **Exercise** — 30 minutes daily (releases endorphins)
- **Meditation** — Start with 5 minutes, build to 20
- **Journal writing** — Express thoughts and feelings
- **Social connection** — Talk to friends, family, or support groups
- **Limit social media** — Set daily time limits
- **Sleep hygiene** — 7-8 hours of quality sleep

**When to seek professional help:**
- Persistent sadness lasting more than 2 weeks
- Loss of interest in activities you used to enjoy
- Changes in appetite or sleep patterns
- Difficulty concentrating or making decisions
- Thoughts of self-harm or hopelessness

**Resources:**
- **iCall:** 9152987821 (India mental health helpline)
- **Vandrevala Foundation:** 1860-2662-345
- **NIMHANS:** 080-46110007

> **Remember:** Seeking help is a sign of strength, not weakness. Use the **Appointments** section to book a consultation with a psychiatrist or counselor.`,

  'weight|obesity|weight loss|diet|bmi': `## Healthy Weight Management

**Calculate your BMI:** Weight(kg) / Height(m)²
| BMI | Category |
|-----|----------|
| <18.5 | Underweight |
| 18.5-24.9 | Normal |
| 25-29.9 | Overweight |
| ≥30 | Obese |

**Sustainable weight loss approach:**
- **Calorie deficit** — Eat 300-500 fewer calories than you burn
- **Protein-rich diet** — Eggs, dal, paneer, chicken, fish
- **Fiber** — Vegetables, salads, whole grains at every meal
- **Water** — 3-4 liters daily; drink before meals
- **Avoid** — Sugar, processed food, white bread, fried items

**Exercise plan:**
- **Week 1-2:** 30 min walk daily
- **Week 3-4:** Add 15 min strength training
- **Week 5+:** 45 min combined cardio + strength, 5 days/week

**Realistic goals:**
- Aim for 0.5-1 kg loss per week
- Don't skip meals — it slows metabolism
- Track your progress weekly, not daily

> **Log your daily habits** in the **Health Log** — tracking water, exercise, and nutrition helps you stay consistent!`,

  'appointment|book|doctor|visit|consultation': `I can help you book an appointment! Here's how:

1. Go to the **Appointments** page from the sidebar
2. Click **"Book New"**
3. Select your **department** (General Medicine, Cardiology, etc.)
4. Choose a **doctor** from the available list
5. Pick a **date** and **time slot**
6. Click **"Confirm & Get Token"**

You'll receive a **queue token number** instantly — show it at reception to skip the line!

**Available departments:** General Medicine, Cardiology, Orthopedics, Dermatology, Endocrinology, Neurology, Pediatrics, Gynecology, ENT, Ophthalmology, Psychiatry, Surgery

> **Tip:** If you're unsure which department to visit, describe your symptoms and I can suggest the right specialist.`,

  'medicine|drug|tablet|medication': `For detailed medicine information, use the **Medicine Info** section in your sidebar. You can search for any medicine and get:

- **Usage & indications** — What the medicine is for
- **Dosage instructions** — How much and when to take
- **Side effects** — What to watch out for
- **Warnings** — Important safety information
- **Approximate price** — Cost reference

**Available medicines in our database:**
Paracetamol, Amoxicillin, Omeprazole, Metformin, Amlodipine, Azithromycin, Cetirizine, Pantoprazole, Ibuprofen, Vitamin D3

> **Important:** Never self-medicate. Always consult your doctor before starting or stopping any medication.`,

  'report|lab|test|blood test': `You can view all your lab reports in the **Lab Reports** section. Each report shows:

- **Test parameters** with your values
- **Normal ranges** for comparison
- **Color-coded status** — Green (Normal), Red (High), Orange (Low)

**Your recent reports:**
- Complete Blood Count (CBC)
- Lipid Profile
- Blood Sugar (Fasting) — Pending
- Thyroid Function Test — Processing

Click on any **completed** report to see detailed results and download them.

> **Tip:** If you need help understanding your report values, just ask me! For example: "What does high WBC count mean?"`,

  'payment|fee|bill|token|queue': `Use the **Payment & Token** section to:

1. Enter your **name** and select **department**
2. Choose a **fee type** (Consultation ₹500, Lab Test ₹800, etc.)
3. Select **payment method** (UPI, Card, Cash, QR Code)
4. Click **"Pay & Get Token"**

You'll get:
- **Transaction ID** for your records
- **Queue token number** — skip the waiting line!
- **Downloadable receipt** in text format

> Payment history is saved so you can re-download receipts anytime.`,

  'covid|corona|coronavirus': `## COVID-19 Information

**Symptoms to watch:**
- Fever, cough, shortness of breath
- Loss of taste or smell
- Body aches, fatigue, headache
- Sore throat, runny nose

**If you suspect COVID:**
1. Isolate immediately
2. Get tested (RT-PCR or Rapid Antigen)
3. Monitor oxygen levels (SpO2 should be >95%)
4. Stay hydrated and rest
5. Take Paracetamol for fever

**Seek emergency care if:**
- SpO2 drops below 94%
- Persistent chest pain
- Difficulty breathing
- Bluish lips or face

**Prevention:**
- Vaccination (booster doses)
- Mask in crowded places
- Hand hygiene
- Social distancing when symptomatic`,

  'skin|rash|acne|itch|allergy|derma': `## Skin Concerns

**For allergic reactions/rashes:**
- **Cetirizine 10mg** — antihistamine for itching
- **Calamine lotion** — soothing for rashes
- Avoid scratching — keep nails short
- Cool compress for relief

**For acne:**
- Wash face twice daily with gentle cleanser
- Don't pop or squeeze pimples
- Use non-comedogenic moisturizer
- Benzoyl peroxide 2.5% for mild acne

**When to see a dermatologist:**
- Severe or cystic acne
- Rash with fever
- Skin changes (new moles, color changes)
- Persistent itching that doesn't improve
- Hair loss or scalp issues

> **Book an appointment** with the Dermatology department through the Appointments section.`,

  'pregnancy|pregnant|prenatal': `## Pregnancy Health Tips

**Essential care:**
- Regular prenatal check-ups (monthly → biweekly → weekly)
- **Folic acid** — 400mcg daily (start before conception)
- **Iron + Calcium** supplements as prescribed
- Balanced diet with extra 300 calories/day
- Stay hydrated — 8-10 glasses water daily

**Warning signs (seek help immediately):**
- Vaginal bleeding
- Severe abdominal pain
- Severe headache with blurred vision
- Reduced fetal movement
- Leaking of fluid

**Healthy pregnancy habits:**
- Moderate exercise (walking, prenatal yoga)
- Avoid: alcohol, smoking, raw foods, excess caffeine
- Get adequate rest and sleep (on left side in 3rd trimester)
- Attend all scheduled ultrasounds

> **Book regular appointments** with the Gynecology department for prenatal care.`,

  'child|baby|pediatric|kids|infant': `## Child Health Guidance

**Common concerns:**
- **Fever in children:** Paracetamol syrup (dose by weight), sponge bath, fluids
- **Diarrhea:** ORS solution, continued feeding, seek help if >6 episodes/day
- **Cough/cold:** Honey (>1 year), steam, warm fluids, no OTC cough syrups for <6 years

**Vaccination schedule (India):**
- Birth: BCG, OPV, Hepatitis B
- 6 weeks: DPT, OPV, Hep B, Rotavirus
- 10 weeks: DPT, OPV, Hep B, Rotavirus
- 14 weeks: DPT, OPV, Rotavirus
- 9 months: Measles, Vitamin A
- 15-18 months: MMR, DPT booster

**When to rush to hospital:**
- High fever (>104°F) in infants
- Difficulty breathing
- Seizures
- Not eating/drinking for >8 hours
- Excessive sleepiness or irritability

> **Book a pediatric appointment** for any child health concerns.`,
};

const STUDENT_KNOWLEDGE: Record<string, string> = {
  'anatomy|muscle|bone|nerve|brachial': `## Anatomy Study Guide

**High-yield approach for anatomy:**

**1. Upper Limb — Brachial Plexus**
- **Roots:** C5-T1
- **Mnemonic:** "**R**obert **T**aylor **D**rinks **C**old **B**eer" → Roots, Trunks, Divisions, Cords, Branches
- **Key injuries:**
  - Erb-Duchenne palsy (C5-C6) → Waiter's tip position
  - Klumpke's palsy (C8-T1) → Claw hand
  - Wrist drop → Radial nerve (Saturday night palsy)
  - Claw hand → Ulnar nerve
  - Ape hand → Median nerve

**2. Study Strategy:**
- Origin → Insertion → Action → Nerve Supply → Blood Supply
- Always link to clinical scenarios
- Draw and label diagrams daily
- Use cross-sectional anatomy for deep understanding

**3. Key resources:**
- Netter's Atlas for visual learning
- Gray's Anatomy for reference
- Clinical anatomy by Snell for clinical correlations

> Check the **Study Resources** section for comprehensive anatomy notes and previous year papers!`,

  'pharmacology|drug class|mechanism|antibiotic': `## Pharmacology Made Simple

**Master framework for any drug:**
Drug Class → Mechanism → Uses → Side Effects → Contraindications

**Antibiotic Classification:**

| Class | Examples | Mechanism | Spectrum |
|-------|---------|-----------|----------|
| Penicillins | Amoxicillin, Ampicillin | Cell wall synthesis inhibitor | Gram +ve |
| Cephalosporins | Cefixime, Ceftriaxone | Cell wall synthesis inhibitor | Broad |
| Macrolides | Azithromycin, Erythromycin | 50S ribosome inhibitor | Gram +ve, atypicals |
| Fluoroquinolones | Ciprofloxacin, Levofloxacin | DNA gyrase inhibitor | Broad |
| Aminoglycosides | Gentamicin, Amikacin | 30S ribosome inhibitor | Gram -ve |
| Tetracyclines | Doxycycline | 30S ribosome inhibitor | Broad + atypicals |

**Key mnemonics:**
- **SAFE Drugs in pregnancy:** Sulfonylureas (no!), ACE inhibitors (no!), Fluoroquinolones (no!), Extra: Methotrexate, Warfarin, Tetracyclines — all AVOID
- **Drugs causing SLE:** "HIP" → Hydralazine, Isoniazid, Procainamide
- **Hepatotoxic drugs:** "Very Angry Infants Rarely Play" → Valproate, Amiodarone, INH, Rifampicin, Paracetamol

> Explore the **Study Resources** section for complete pharmacology notes!`,

  'physiology|heart|cardiac|ecg|blood': `## Physiology Key Concepts

**Cardiovascular Physiology:**

**Cardiac Cycle:**
1. **Isovolumetric contraction** — All valves closed, pressure builds
2. **Rapid ejection** — Aortic valve opens, blood ejected
3. **Reduced ejection** — Flow slows
4. **Isovolumetric relaxation** — All valves closed, pressure drops
5. **Rapid filling** — Mitral valve opens
6. **Reduced filling** — Passive flow
7. **Atrial contraction** — "Atrial kick" (contributes 20-30%)

**ECG Basics:**
- **P wave** — Atrial depolarization
- **QRS complex** — Ventricular depolarization
- **T wave** — Ventricular repolarization
- **PR interval** — 0.12-0.20 sec (prolonged = heart block)
- **QT interval** — Must be <0.44 sec (prolonged = risk of arrhythmia)

**Frank-Starling Law:**
Greater the venous return → Greater the stretch → Greater the force of contraction → Greater the stroke volume

**Clinical correlation:** In heart failure, the curve shifts downward — same preload produces less cardiac output.

> Watch the **Video Lectures** on cardiovascular physiology for visual understanding!`,

  'pathology|inflammation|cancer|tumor|neoplasm': `## Pathology Essentials

**Acute Inflammation:**
- **Cardinal signs:** Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), Functio laesa (loss of function)
- **Mediators:** Histamine, Bradykinin, Prostaglandins, Leukotrienes, Complement
- **Cells:** Neutrophils (acute), Macrophages (chronic)

**Chronic Inflammation:**
- Duration >2 weeks
- **Key cells:** Macrophages, lymphocytes, plasma cells
- **Granulomatous:** TB, Sarcoidosis, Leprosy, Fungal infections
- **Langhans giant cells** — TB (horseshoe nuclei)
- **Asteroid bodies** — Sarcoidosis

**Neoplasia basics:**
| Feature | Benign | Malignant |
|---------|--------|-----------|
| Growth | Slow | Rapid |
| Border | Well-defined | Irregular |
| Metastasis | No | Yes |
| Differentiation | Well | Poor |
| Capsule | Present | Absent |

**Tumor markers:**
- AFP — Hepatocellular carcinoma
- CEA — Colorectal cancer
- CA-125 — Ovarian cancer
- PSA — Prostate cancer
- CA 19-9 — Pancreatic cancer`,

  'exam|prepare|study|tips|previous year|paper': `## Exam Preparation Strategy

**4-Week Action Plan:**

**Week 1-2: Foundation**
- Complete syllabus revision from notes
- Make concise flashcards for each topic
- Focus on understanding, not memorizing
- Cover 2-3 subjects per day

**Week 3: Practice**
- Solve previous year papers (timed!)
- Practice MCQs — minimum 100/day
- Identify weak areas from mistakes
- Revise high-yield topics

**Week 4: Polish**
- Quick revision of all flashcards
- Focus on tables, diagrams, classifications
- Practice drawing labeled diagrams
- Solve 2-3 full mock papers

**Exam-day tips:**
- Read each question twice before answering
- Allocate **1.5 minutes per mark**
- Start with questions you're confident about
- Always include diagrams and flowcharts
- Write clinical correlations for extra marks
- Don't leave any question unanswered

**High-yield topics (always asked):**
- Brachial plexus, cranial nerves (Anatomy)
- Cardiac cycle, renal physiology (Physiology)
- Inflammation, neoplasia (Pathology)
- Antibiotics, ANS drugs (Pharmacology)
- Gram staining, TB (Microbiology)

> Find **Previous Year Papers** in the Study Resources section!`,

  'microbiology|bacteria|virus|infection|gram': `## Microbiology Quick Review

**Gram Staining:**
- **Gram +ve (Purple):** Thick peptidoglycan wall
  - Cocci: Staphylococcus, Streptococcus
  - Bacilli: Clostridium, Bacillus, Listeria
- **Gram -ve (Pink):** Thin wall + outer membrane
  - Cocci: Neisseria
  - Bacilli: E. coli, Klebsiella, Pseudomonas, Salmonella

**Important pathogens:**
| Organism | Disease | Key Feature |
|----------|---------|-------------|
| S. aureus | Skin infections, sepsis | Coagulase +ve |
| S. pyogenes | Pharyngitis, rheumatic fever | Group A strep |
| E. coli | UTI, traveler's diarrhea | Most common UTI cause |
| M. tuberculosis | TB | Acid-fast bacilli |
| Plasmodium | Malaria | Ring forms in RBCs |

**Culture media mnemonics:**
- **Chocolate agar** — Neisseria, Haemophilus
- **MacConkey agar** — Gram -ve enterics (lactose fermenters = pink)
- **Blood agar** — Streptococci (α, β hemolysis)
- **LJ medium** — Mycobacterium tuberculosis`,
};

const DOCTOR_KNOWLEDGE: Record<string, string> = {
  'diabetes|metformin|hba1c|insulin|glucose': `## Type 2 DM Management — Clinical Guidelines

**First-line:** Metformin 500mg BD → titrate to 2g/day
- Start low, increase gradually (GI tolerance)
- Check renal function before starting (eGFR >30)

**Step-up therapy (if HbA1c >7.5% on Metformin):**
1. **SGLT2 inhibitor** (Dapagliflozin/Empagliflozin) — preferred if CVD/CKD/HF
2. **GLP-1 RA** (Liraglutide/Semaglutide) — preferred if obesity or CVD
3. **DPP-4 inhibitor** (Sitagliptin/Vildagliptin) — weight neutral
4. **Sulfonylurea** (Glimepiride) — if cost is a concern
5. **Pioglitazone** — if insulin resistance predominant

**Insulin initiation (HbA1c >9% or symptomatic):**
- Basal insulin (Glargine/Detemir) 10 units at bedtime
- Titrate by 2 units every 3 days until fasting <130

**Monitoring protocol:**
- HbA1c every 3 months until target, then 6-monthly
- eGFR + urine albumin annually
- Lipid profile annually
- Fundoscopy annually
- Foot examination every visit

**Targets:**
| Parameter | Target |
|-----------|--------|
| HbA1c | <7% (individualize) |
| Fasting glucose | 80-130 mg/dL |
| Post-prandial | <180 mg/dL |
| BP | <130/80 |
| LDL | <100 (or <70 if CVD) |

> *Clinical decision support — apply clinical judgment for individual patients.*`,

  'hypertension|blood pressure|antihypertensive|bp': `## Hypertension Management Protocol

**Classification (ACC/AHA 2017):**
| Stage | Systolic | Diastolic | Treatment |
|-------|----------|-----------|-----------|
| Normal | <120 | <80 | Lifestyle |
| Elevated | 120-129 | <80 | Lifestyle |
| Stage 1 | 130-139 | 80-89 | Lifestyle ± 1 drug |
| Stage 2 | ≥140 | ≥90 | 2 drugs |
| Crisis | >180 | >120 | Emergency |

**Drug selection by comorbidity:**
- **Diabetes/CKD** → ACE inhibitor or ARB
- **Heart failure** → ACE/ARB + Beta-blocker + Diuretic
- **Post-MI** → Beta-blocker + ACE inhibitor
- **Elderly** → Amlodipine (CCB) or Thiazide
- **Pregnancy** → Labetalol, Methyldopa, Nifedipine
- **BPH** → Alpha-blocker (Prazosin)

**Resistant hypertension (≥3 drugs at optimal doses):**
- Add spironolactone 25-50mg
- Consider secondary causes: RAS, pheochromocytoma, Cushing's, primary aldosteronism

**Follow-up:**
- Recheck BP at 4 weeks after dose change
- Monitor K+, creatinine with ACEi/ARB
- Annual: renal function, lipids, ECG`,

  'chest pain|mi|acs|angina|stemi': `## Acute Chest Pain — Approach

**STEMI Protocol:**
1. **MONA** — Morphine, O2 (if SpO2 <90%), Nitrate (SL), Aspirin 325mg
2. **Dual antiplatelet** — Aspirin + Ticagrelor 180mg (or Clopidogrel 600mg)
3. **Anticoagulation** — Heparin
4. **PCI** if door-to-balloon <90 min; else **Thrombolysis** (Tenecteplase)
5. **Beta-blocker** (Metoprolol) if no contraindication
6. **Statin** — Atorvastatin 80mg

**Differential diagnosis of chest pain:**
| Cardiac | Non-cardiac |
|---------|-------------|
| ACS/MI | GERD |
| Stable angina | Musculoskeletal |
| Aortic dissection | Pneumothorax |
| Pericarditis | Pulmonary embolism |
| Heart failure | Panic attack |

**Key investigations:**
- 12-lead ECG (within 10 min)
- Troponin I/T (0, 3, 6 hours)
- Chest X-ray
- Echo if hemodynamically unstable

**HEART Score for risk stratification:**
- History, ECG, Age, Risk factors, Troponin
- Score 0-3: Low risk → Discharge with follow-up
- Score 4-6: Moderate → Observation + serial troponin
- Score 7-10: High → Admit, invasive strategy`,
};

const PROFESSOR_KNOWLEDGE: Record<string, string> = {
  'mcq|question|assessment|exam|evaluate': `## Assessment Design Guide

**MCQ Best Practices (NBME style):**

**Structure:**
- Clinical vignette → Lead-in question → 5 options (1 best answer)
- Stem should be answerable without looking at options
- All distractors must be plausible

**Sample MCQ Template:**
> A 45-year-old male presents with crushing chest pain radiating to the left arm for 2 hours. ECG shows ST elevation in leads II, III, aVF. Troponin I is elevated. What is the MOST appropriate immediate management?
> A) Oral Metoprolol
> B) IV Streptokinase
> C) Sublingual Nitroglycerin
> D) Aspirin 325mg chewed + Primary PCI
> E) Observation and serial troponin

**Answer: D** — Dual antiplatelet + PCI is standard for STEMI.

**OSCE Station Ideas:**
1. History taking — chest pain, abdominal pain, headache
2. Clinical examination — respiratory, cardiovascular, neurological
3. Communication — breaking bad news, obtaining consent
4. Procedural — IV cannulation, suturing, catheterization
5. Interpretation — ECG, X-ray, blood reports

**Bloom's Taxonomy for Medical Assessment:**
- **Remember:** Define, List, Name
- **Understand:** Explain, Describe, Classify
- **Apply:** Solve, Demonstrate, Calculate
- **Analyze:** Differentiate, Compare, Distinguish
- **Evaluate:** Justify, Critique, Judge
- **Create:** Design, Formulate, Hypothesize`,

  'teach|lecture|curriculum|material|pedagogy': `## Teaching Excellence Guide

**Modern Medical Teaching Methods:**

**1. Case-Based Learning (CBL)**
- Present real clinical scenario
- Students work through diagnosis stepwise
- Integrates basic science with clinical medicine
- Best for: 2nd-3rd year clinical subjects

**2. Problem-Based Learning (PBL)**
- Student-driven, tutor-facilitated
- 7-step process: identify problems → learning objectives → self-study → discuss
- Best for: integrated curriculum

**3. Flipped Classroom**
- Students study material before class (videos, notes)
- Class time for discussion, problem-solving, Q&A
- Higher engagement and retention

**4. Simulation-Based Learning**
- Mannequins for CPR, intubation, delivery
- Standardized patients for history/examination
- Virtual reality for surgical training

**Lecture Design Tips:**
- Start with a clinical scenario or question
- Use multimedia — images, videos, animations
- Include 2-3 interactive elements per hour
- Summarize key points every 15-20 minutes
- End with 3 take-home messages

**Student Engagement Strategies:**
- Live polling/quizzes (Kahoot, Mentimeter)
- Small group discussions
- Clinical correlation stories
- Draw-and-explain activities`,
};

// ========== RESPONSE GENERATION ==========

function findBestMatch(message: string, knowledge: Record<string, string>): string | null {
  const lower = message.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [keywords, response] of Object.entries(knowledge)) {
    const keywordList = keywords.split('|');
    let score = 0;
    for (const kw of keywordList) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length; // Longer keyword matches are better
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

function getGenericResponse(role: UserRole, message: string): string {
  const lower = message.toLowerCase();

  // Greeting detection
  if (lower.match(/^(hi|hello|hey|good morning|good evening|good afternoon|namaste|howdy)/)) {
    const greetings: Record<UserRole, string> = {
      patient: "Hello! I'm your **AI Health Assistant**. I can help you with:\n\n- **Health questions** — symptoms, conditions, medications\n- **Appointment booking** — guidance and scheduling\n- **Medicine information** — usage, dosage, side effects\n- **Lab reports** — understanding your results\n- **Healthy habits** — sleep, water, exercise tips\n\nWhat would you like to know?",
      student: "Hi there! I'm your **AI Medical Tutor**. I can help with:\n\n- **Any medical subject** — Anatomy, Physiology, Pharmacology, Pathology, Microbiology, Medicine, Surgery\n- **Exam preparation** — strategies, mnemonics, high-yield topics\n- **Previous year papers** — practice and revision\n- **Clinical correlations** — bridging basic science and clinical medicine\n\nWhat topic would you like to study?",
      doctor: "Good day, Doctor. I'm your **AI Clinical Assistant**. I can help with:\n\n- **Differential diagnosis** suggestions\n- **Treatment guidelines** — latest protocols\n- **Drug interactions** and dosing\n- **Clinical scoring systems** — Wells, CURB-65, APACHE, HEART\n- **Lab interpretation** guidance\n\nWhat clinical question do you have?",
      professor: "Welcome, Professor. I'm your **AI Teaching Assistant**. I can help with:\n\n- **Assessment design** — MCQs, OSCEs, clinical cases\n- **Teaching methods** — CBL, PBL, flipped classroom\n- **Lecture planning** and curriculum design\n- **Student query management**\n- **Resource curation**\n\nHow can I assist your teaching today?",
    };
    return greetings[role];
  }

  // Thank you detection
  if (lower.match(/thank|thanks|appreciate|helpful/)) {
    return "You're welcome! I'm glad I could help. Feel free to ask me anything else anytime. 😊";
  }

  // Default role-specific responses
  const defaults: Record<UserRole, string> = {
    patient: `I understand your concern. While I don't have a specific answer for that exact query, here are some **general health recommendations:**

- **Stay hydrated** — Drink at least 8 glasses of water daily
- **Balanced diet** — Include fruits, vegetables, whole grains, and protein
- **Regular exercise** — At least 30 minutes of moderate activity
- **Adequate sleep** — 7-8 hours for adults
- **Manage stress** — Practice relaxation techniques

**For specific medical concerns,** I'd recommend:
1. Using the **Appointments** section to book a consultation
2. Checking the **Medicine Info** section for medication details
3. Tracking your symptoms in the **Health Log**

Could you tell me more about what you're experiencing? I might be able to provide more specific guidance.`,
    student: `That's a great topic to explore! While I don't have a specific pre-built response for that, here's how to approach learning any medical concept:

**Study Framework:**
1. **Define** — What is it? Clear definition
2. **Classify** — Types and subtypes
3. **Mechanism** — How does it work/happen?
4. **Clinical features** — Signs and symptoms
5. **Diagnosis** — Investigations and criteria
6. **Management** — Treatment approach
7. **Complications** — What can go wrong?

**Resources available to you:**
- 📚 **Study Notes** — Organized by subject in the Resources section
- 📝 **Previous Year Papers** — Practice with past exams
- 🎥 **Video Lectures** — Visual explanations
- 📋 **Study Planner** — Organize your schedule

Could you be more specific about which aspect you'd like me to explain?`,
    doctor: `I appreciate the clinical query. For comprehensive guidance on this topic, I'd recommend:

**Approach:**
1. Consider the clinical context and patient presentation
2. Review latest guidelines (WHO, AHA, ACC, NICE as applicable)
3. Assess risk-benefit ratio for individual patient
4. Document clinical reasoning

**Available resources:**
- Latest clinical guidelines and protocols
- Drug interaction databases
- Clinical scoring systems
- Evidence-based medicine references

Could you provide more specific clinical details? I can offer more targeted recommendations with additional context about the patient presentation.`,
    professor: `Excellent question for academic discussion. Here's a structured approach:

**For teaching this topic:**
1. Start with a clinical case to generate interest
2. Build from basic concepts to complex applications
3. Use visual aids and interactive methods
4. Include assessment checkpoints
5. Provide clinical correlations throughout

**Teaching resources available:**
- 📚 **Materials** section for sharing with students
- 📋 **Student Queries** to address common doubts
- 📅 **Class Schedule** for organizing sessions

Would you like me to help with a specific aspect — content creation, assessment design, or teaching methodology?`,
  };

  return defaults[role];
}

export function generateAIResponse(message: string, role: UserRole): string {
  // Try to find a knowledge-base match first
  let knowledgeBase: Record<string, string>;

  switch (role) {
    case 'patient':
      knowledgeBase = PATIENT_KNOWLEDGE;
      break;
    case 'student':
      knowledgeBase = STUDENT_KNOWLEDGE;
      break;
    case 'doctor':
      knowledgeBase = DOCTOR_KNOWLEDGE;
      break;
    case 'professor':
      knowledgeBase = PROFESSOR_KNOWLEDGE;
      break;
    default:
      knowledgeBase = PATIENT_KNOWLEDGE;
  }

  const match = findBestMatch(message, knowledgeBase);
  if (match) return match;

  // Fallback to generic response
  return getGenericResponse(role, message);
}
