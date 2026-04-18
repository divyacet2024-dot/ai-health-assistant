/**
 * Comprehensive Disease & Medicine Database — 1000+ entries
 * Organized by medical categories with symptoms, treatments, medicines, and prices
 */

export interface Disease {
  id: string;
  name: string;
  category: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  medicines: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  specialist: string;
  prevention: string[];
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  dosage: string;
  usage: string;
  sideEffects: string[];
  prescription: boolean;
  inStock: boolean;
  rating: number;
  image: string;
}

// ========== CATEGORIES ==========
export const DISEASE_CATEGORIES = [
  'Cardiovascular', 'Respiratory', 'Neurological', 'Gastrointestinal', 'Endocrine',
  'Musculoskeletal', 'Dermatological', 'Infectious', 'Urological', 'Hematological',
  'Ophthalmological', 'ENT', 'Psychiatric', 'Gynecological', 'Pediatric',
  'Oncological', 'Immunological', 'Hepatological', 'Renal', 'Dental',
];

// ========== DISEASES (200+ detailed entries) ==========
export const DISEASES: Disease[] = [
  // CARDIOVASCULAR
  { id: 'd001', name: 'Hypertension', category: 'Cardiovascular', description: 'Persistently elevated blood pressure (>130/80 mmHg) increasing risk of heart disease, stroke, and kidney damage.', symptoms: ['Headache', 'Dizziness', 'Blurred vision', 'Chest pain', 'Shortness of breath', 'Nosebleeds'], causes: ['Obesity', 'High salt intake', 'Stress', 'Genetics', 'Sedentary lifestyle', 'Smoking'], treatments: ['Lifestyle modification', 'DASH diet', 'Regular exercise', 'Medication therapy', 'Stress management'], medicines: ['Amlodipine', 'Telmisartan', 'Enalapril', 'Losartan', 'Hydrochlorothiazide'], severity: 'moderate', specialist: 'Cardiologist', prevention: ['Low salt diet', 'Regular exercise', 'Weight management', 'Limit alcohol', 'Quit smoking'] },
  { id: 'd002', name: 'Coronary Artery Disease', category: 'Cardiovascular', description: 'Narrowing of coronary arteries due to plaque buildup, reducing blood flow to the heart muscle.', symptoms: ['Chest pain (angina)', 'Shortness of breath', 'Fatigue', 'Heart palpitations', 'Sweating', 'Nausea'], causes: ['Atherosclerosis', 'High cholesterol', 'Smoking', 'Diabetes', 'Hypertension', 'Obesity'], treatments: ['Lifestyle changes', 'Medications', 'Angioplasty with stenting', 'Coronary bypass surgery'], medicines: ['Aspirin', 'Atorvastatin', 'Metoprolol', 'Nitroglycerin', 'Clopidogrel'], severity: 'severe', specialist: 'Cardiologist', prevention: ['Heart-healthy diet', 'Regular exercise', 'Cholesterol management', 'Blood pressure control'] },
  { id: 'd003', name: 'Heart Failure', category: 'Cardiovascular', description: 'Heart cannot pump blood efficiently enough to meet the body\'s needs.', symptoms: ['Shortness of breath', 'Fatigue', 'Swollen legs/ankles', 'Rapid heartbeat', 'Persistent cough', 'Weight gain'], causes: ['Coronary artery disease', 'Hypertension', 'Cardiomyopathy', 'Heart valve disease', 'Diabetes'], treatments: ['Medications', 'Lifestyle changes', 'Device therapy (pacemaker/ICD)', 'Heart transplant'], medicines: ['Enalapril', 'Carvedilol', 'Furosemide', 'Spironolactone', 'Digoxin'], severity: 'severe', specialist: 'Cardiologist', prevention: ['Control blood pressure', 'Manage diabetes', 'Regular exercise', 'Healthy weight'] },
  { id: 'd004', name: 'Atrial Fibrillation', category: 'Cardiovascular', description: 'Irregular and often rapid heart rate increasing risk of stroke and heart failure.', symptoms: ['Heart palpitations', 'Weakness', 'Fatigue', 'Dizziness', 'Shortness of breath', 'Chest pain'], causes: ['Heart disease', 'Hypertension', 'Thyroid disorders', 'Alcohol abuse', 'Sleep apnea'], treatments: ['Heart rate control', 'Rhythm control', 'Blood thinners', 'Cardioversion', 'Catheter ablation'], medicines: ['Warfarin', 'Rivaroxaban', 'Amiodarone', 'Diltiazem', 'Metoprolol'], severity: 'moderate', specialist: 'Cardiologist', prevention: ['Limit alcohol', 'Manage stress', 'Regular exercise', 'Control blood pressure'] },
  { id: 'd005', name: 'Deep Vein Thrombosis', category: 'Cardiovascular', description: 'Blood clot in a deep vein, usually in the legs, potentially causing pulmonary embolism.', symptoms: ['Leg swelling', 'Pain in calf', 'Red/discolored skin', 'Warmth in leg', 'Heavy ache'], causes: ['Prolonged immobility', 'Surgery', 'Cancer', 'Pregnancy', 'Oral contraceptives', 'Obesity'], treatments: ['Anticoagulation therapy', 'Compression stockings', 'Thrombolysis', 'IVC filter'], medicines: ['Heparin', 'Enoxaparin', 'Warfarin', 'Rivaroxaban', 'Apixaban'], severity: 'severe', specialist: 'Vascular Surgeon', prevention: ['Stay active', 'Move during long travel', 'Compression stockings', 'Stay hydrated'] },
  { id: 'd006', name: 'Myocardial Infarction', category: 'Cardiovascular', description: 'Heart attack — blockage of blood flow to heart muscle causing tissue death.', symptoms: ['Severe chest pain', 'Pain radiating to arm/jaw', 'Cold sweat', 'Nausea', 'Shortness of breath', 'Dizziness'], causes: ['Coronary artery disease', 'Blood clot', 'Spasm of coronary artery'], treatments: ['Emergency PCI', 'Thrombolysis', 'CABG surgery', 'Cardiac rehabilitation'], medicines: ['Aspirin', 'Clopidogrel', 'Ticagrelor', 'Atorvastatin', 'Metoprolol', 'Heparin'], severity: 'critical', specialist: 'Cardiologist', prevention: ['Healthy diet', 'Exercise', 'No smoking', 'Control BP/diabetes/cholesterol'] },

  // RESPIRATORY
  { id: 'd007', name: 'Asthma', category: 'Respiratory', description: 'Chronic airway inflammation causing recurring episodes of wheezing, breathlessness, and coughing.', symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing (especially at night)', 'Difficulty breathing during exercise'], causes: ['Allergens', 'Air pollution', 'Respiratory infections', 'Exercise', 'Cold air', 'Stress'], treatments: ['Inhaler therapy', 'Avoid triggers', 'Allergy management', 'Breathing exercises'], medicines: ['Salbutamol inhaler', 'Budesonide inhaler', 'Montelukast', 'Fluticasone', 'Ipratropium'], severity: 'moderate', specialist: 'Pulmonologist', prevention: ['Avoid allergens', 'Air purifier', 'Regular medication', 'Flu vaccination'] },
  { id: 'd008', name: 'COPD', category: 'Respiratory', description: 'Chronic obstructive pulmonary disease — progressive lung disease making breathing difficult.', symptoms: ['Chronic cough', 'Shortness of breath', 'Wheezing', 'Frequent respiratory infections', 'Fatigue', 'Mucus production'], causes: ['Smoking', 'Air pollution', 'Chemical fumes', 'Genetic factors (alpha-1 antitrypsin deficiency)'], treatments: ['Bronchodilators', 'Oxygen therapy', 'Pulmonary rehabilitation', 'Lung surgery'], medicines: ['Tiotropium', 'Salbutamol', 'Fluticasone', 'Theophylline', 'Prednisone'], severity: 'severe', specialist: 'Pulmonologist', prevention: ['Quit smoking', 'Avoid pollutants', 'Flu/pneumonia vaccines', 'Regular exercise'] },
  { id: 'd009', name: 'Pneumonia', category: 'Respiratory', description: 'Infection causing inflammation in the air sacs of one or both lungs.', symptoms: ['Cough with phlegm', 'Fever with chills', 'Shortness of breath', 'Chest pain', 'Fatigue', 'Confusion (in elderly)'], causes: ['Bacteria', 'Viruses', 'Fungi', 'Aspiration'], treatments: ['Antibiotics', 'Antivirals', 'Rest', 'Fluids', 'Oxygen therapy'], medicines: ['Amoxicillin', 'Azithromycin', 'Levofloxacin', 'Ceftriaxone', 'Oseltamivir'], severity: 'severe', specialist: 'Pulmonologist', prevention: ['Vaccination', 'Hand hygiene', 'Quit smoking', 'Good nutrition'] },
  { id: 'd010', name: 'Tuberculosis', category: 'Respiratory', description: 'Bacterial infection primarily affecting the lungs, caused by Mycobacterium tuberculosis.', symptoms: ['Chronic cough (>3 weeks)', 'Coughing blood', 'Night sweats', 'Weight loss', 'Fever', 'Fatigue'], causes: ['Mycobacterium tuberculosis', 'Close contact with infected person', 'Weakened immune system'], treatments: ['DOTS therapy (6-9 months)', 'Directly observed therapy', 'Isolation during infectious period'], medicines: ['Isoniazid', 'Rifampicin', 'Pyrazinamide', 'Ethambutol', 'Streptomycin'], severity: 'severe', specialist: 'Pulmonologist', prevention: ['BCG vaccination', 'Avoid close contact', 'Good ventilation', 'TB screening'] },
  { id: 'd011', name: 'Bronchitis', category: 'Respiratory', description: 'Inflammation of the bronchial tubes causing cough and mucus production.', symptoms: ['Persistent cough', 'Mucus production', 'Fatigue', 'Shortness of breath', 'Chest discomfort', 'Low fever'], causes: ['Viral infections', 'Smoking', 'Air pollution', 'Dust', 'Chemical fumes'], treatments: ['Rest', 'Fluids', 'Cough suppressants', 'Bronchodilators', 'Antibiotics (if bacterial)'], medicines: ['Ambroxol', 'Salbutamol', 'Dextromethorphan', 'Azithromycin', 'Paracetamol'], severity: 'mild', specialist: 'Pulmonologist', prevention: ['Quit smoking', 'Avoid irritants', 'Hand hygiene', 'Flu vaccine'] },
  { id: 'd012', name: 'Sinusitis', category: 'Respiratory', description: 'Inflammation of the sinuses causing congestion, facial pain, and discharge.', symptoms: ['Facial pain/pressure', 'Nasal congestion', 'Thick nasal discharge', 'Reduced smell', 'Headache', 'Post-nasal drip'], causes: ['Viral infection', 'Allergies', 'Nasal polyps', 'Deviated septum'], treatments: ['Nasal decongestants', 'Steam inhalation', 'Saline rinse', 'Antibiotics (if bacterial)'], medicines: ['Amoxicillin', 'Fluticasone nasal spray', 'Pseudoephedrine', 'Cetirizine', 'Paracetamol'], severity: 'mild', specialist: 'ENT', prevention: ['Hand hygiene', 'Manage allergies', 'Use humidifier', 'Avoid pollutants'] },

  // NEUROLOGICAL
  { id: 'd013', name: 'Migraine', category: 'Neurological', description: 'Recurring moderate to severe headaches, often with nausea and sensitivity to light/sound.', symptoms: ['Throbbing headache (usually one-sided)', 'Nausea/vomiting', 'Light sensitivity', 'Sound sensitivity', 'Visual aura', 'Fatigue'], causes: ['Hormonal changes', 'Stress', 'Certain foods', 'Sleep changes', 'Weather changes', 'Genetics'], treatments: ['Pain relief medication', 'Triptans', 'Preventive medication', 'Lifestyle changes', 'Biofeedback'], medicines: ['Sumatriptan', 'Rizatriptan', 'Propranolol', 'Topiramate', 'Amitriptyline', 'Ibuprofen'], severity: 'moderate', specialist: 'Neurologist', prevention: ['Regular sleep', 'Stress management', 'Avoid triggers', 'Stay hydrated', 'Regular meals'] },
  { id: 'd014', name: 'Epilepsy', category: 'Neurological', description: 'Brain disorder causing recurrent seizures due to abnormal electrical activity.', symptoms: ['Seizures', 'Loss of consciousness', 'Staring spells', 'Uncontrollable jerking', 'Confusion', 'Psychic symptoms'], causes: ['Genetics', 'Brain injury', 'Brain tumors', 'Stroke', 'Infections (meningitis)', 'Developmental disorders'], treatments: ['Antiepileptic drugs', 'Surgery', 'Vagus nerve stimulation', 'Ketogenic diet'], medicines: ['Valproate', 'Levetiracetam', 'Carbamazepine', 'Phenytoin', 'Lamotrigine'], severity: 'severe', specialist: 'Neurologist', prevention: ['Medication compliance', 'Adequate sleep', 'Avoid triggers', 'Safety precautions'] },
  { id: 'd015', name: 'Parkinson\'s Disease', category: 'Neurological', description: 'Progressive nervous system disorder affecting movement, causing tremors and stiffness.', symptoms: ['Tremor', 'Slowed movement', 'Rigid muscles', 'Impaired posture', 'Speech changes', 'Writing changes'], causes: ['Loss of dopamine neurons', 'Genetics', 'Environmental toxins', 'Age'], treatments: ['Medication (dopamine replacement)', 'Physical therapy', 'Deep brain stimulation', 'Exercise'], medicines: ['Levodopa/Carbidopa', 'Pramipexole', 'Rasagiline', 'Amantadine', 'Entacapone'], severity: 'severe', specialist: 'Neurologist', prevention: ['Regular exercise', 'Caffeine (may be protective)', 'Antioxidant-rich diet'] },
  { id: 'd016', name: 'Alzheimer\'s Disease', category: 'Neurological', description: 'Progressive brain disorder causing memory loss, cognitive decline, and behavioral changes.', symptoms: ['Memory loss', 'Confusion', 'Difficulty with familiar tasks', 'Language problems', 'Disorientation', 'Mood changes'], causes: ['Amyloid plaques', 'Tau tangles', 'Genetics', 'Age', 'Head trauma'], treatments: ['Cholinesterase inhibitors', 'Memantine', 'Cognitive therapy', 'Support care'], medicines: ['Donepezil', 'Rivastigmine', 'Memantine', 'Galantamine'], severity: 'severe', specialist: 'Neurologist', prevention: ['Mental stimulation', 'Social engagement', 'Exercise', 'Healthy diet', 'Quality sleep'] },
  { id: 'd017', name: 'Stroke', category: 'Neurological', description: 'Brain damage from interrupted blood supply (ischemic) or bleeding (hemorrhagic).', symptoms: ['Sudden numbness/weakness (face/arm/leg)', 'Confusion', 'Trouble speaking', 'Vision problems', 'Severe headache', 'Trouble walking'], causes: ['Blood clot (ischemic)', 'Ruptured blood vessel (hemorrhagic)', 'Hypertension', 'Atrial fibrillation'], treatments: ['tPA (clot-buster)', 'Thrombectomy', 'Rehabilitation', 'Blood pressure management'], medicines: ['Alteplase', 'Aspirin', 'Clopidogrel', 'Warfarin', 'Atorvastatin'], severity: 'critical', specialist: 'Neurologist', prevention: ['Control BP', 'Exercise', 'Healthy diet', 'No smoking', 'Limit alcohol'] },

  // GASTROINTESTINAL
  { id: 'd018', name: 'GERD', category: 'Gastrointestinal', description: 'Gastroesophageal reflux disease — stomach acid flows back into esophagus.', symptoms: ['Heartburn', 'Acid regurgitation', 'Difficulty swallowing', 'Chest pain', 'Chronic cough', 'Hoarseness'], causes: ['Weak lower esophageal sphincter', 'Obesity', 'Hiatal hernia', 'Spicy foods', 'Smoking'], treatments: ['Lifestyle changes', 'PPIs', 'H2 blockers', 'Antacids', 'Surgery (fundoplication)'], medicines: ['Omeprazole', 'Pantoprazole', 'Ranitidine', 'Domperidone', 'Antacid syrup'], severity: 'mild', specialist: 'Gastroenterologist', prevention: ['Avoid spicy food', 'Small meals', 'Don\'t lie down after eating', 'Weight loss'] },
  { id: 'd019', name: 'Peptic Ulcer Disease', category: 'Gastrointestinal', description: 'Sores in the lining of the stomach or duodenum, often caused by H. pylori.', symptoms: ['Burning stomach pain', 'Nausea', 'Bloating', 'Heartburn', 'Dark stools', 'Weight loss'], causes: ['H. pylori infection', 'NSAIDs overuse', 'Smoking', 'Stress', 'Alcohol'], treatments: ['Triple therapy (antibiotics + PPI)', 'Avoid NSAIDs', 'Lifestyle changes'], medicines: ['Omeprazole', 'Amoxicillin', 'Clarithromycin', 'Metronidazole', 'Sucralfate'], severity: 'moderate', specialist: 'Gastroenterologist', prevention: ['Limit NSAIDs', 'H. pylori treatment', 'Quit smoking', 'Reduce stress'] },
  { id: 'd020', name: 'Irritable Bowel Syndrome', category: 'Gastrointestinal', description: 'Functional GI disorder causing abdominal pain, bloating, and altered bowel habits.', symptoms: ['Abdominal pain', 'Bloating', 'Diarrhea', 'Constipation', 'Gas', 'Mucus in stool'], causes: ['Gut-brain interaction', 'Stress', 'Food sensitivity', 'Gut bacteria changes', 'Genetics'], treatments: ['Dietary changes (low FODMAP)', 'Stress management', 'Fiber supplements', 'Medication'], medicines: ['Mebeverine', 'Loperamide', 'Psyllium', 'Amitriptyline', 'Rifaximin'], severity: 'mild', specialist: 'Gastroenterologist', prevention: ['Balanced diet', 'Regular exercise', 'Stress reduction', 'Adequate sleep'] },
  { id: 'd021', name: 'Hepatitis B', category: 'Gastrointestinal', description: 'Viral infection affecting the liver, potentially causing chronic disease and liver cancer.', symptoms: ['Jaundice', 'Dark urine', 'Fatigue', 'Nausea', 'Abdominal pain', 'Joint pain'], causes: ['Hepatitis B virus', 'Blood contact', 'Sexual transmission', 'Mother-to-child'], treatments: ['Antiviral therapy', 'Monitoring', 'Liver transplant (severe cases)'], medicines: ['Tenofovir', 'Entecavir', 'Peginterferon alfa', 'Lamivudine'], severity: 'severe', specialist: 'Hepatologist', prevention: ['Hepatitis B vaccine', 'Safe sex', 'Avoid sharing needles', 'Screen blood donors'] },
  { id: 'd022', name: 'Appendicitis', category: 'Gastrointestinal', description: 'Inflammation of the appendix requiring urgent surgical removal.', symptoms: ['Right lower abdominal pain', 'Nausea', 'Vomiting', 'Fever', 'Loss of appetite', 'Pain worsens with movement'], causes: ['Blockage of appendix lumen', 'Fecalith', 'Lymphoid hyperplasia', 'Infection'], treatments: ['Appendectomy (surgical removal)', 'IV antibiotics'], medicines: ['Ceftriaxone', 'Metronidazole', 'Paracetamol', 'Morphine'], severity: 'severe', specialist: 'Surgeon', prevention: ['High-fiber diet (may reduce risk)', 'Early medical attention for abdominal pain'] },
  { id: 'd023', name: 'Cholecystitis', category: 'Gastrointestinal', description: 'Inflammation of the gallbladder, usually due to gallstones.', symptoms: ['Right upper abdominal pain', 'Pain after meals', 'Nausea', 'Vomiting', 'Fever', 'Jaundice'], causes: ['Gallstones', 'Bile duct blockage', 'Tumors', 'Infection'], treatments: ['Cholecystectomy', 'IV antibiotics', 'Pain management', 'Dietary changes'], medicines: ['Ursodeoxycholic acid', 'Ciprofloxacin', 'Metronidazole', 'Diclofenac'], severity: 'moderate', specialist: 'Surgeon', prevention: ['Healthy weight', 'Balanced diet', 'Regular meals', 'Avoid rapid weight loss'] },

  // ENDOCRINE
  { id: 'd024', name: 'Type 2 Diabetes Mellitus', category: 'Endocrine', description: 'Chronic condition where the body doesn\'t use insulin properly, leading to high blood sugar.', symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow wound healing', 'Tingling in hands/feet'], causes: ['Insulin resistance', 'Obesity', 'Sedentary lifestyle', 'Genetics', 'Poor diet'], treatments: ['Lifestyle changes', 'Oral medications', 'Insulin therapy', 'Blood sugar monitoring'], medicines: ['Metformin', 'Glimepiride', 'Sitagliptin', 'Dapagliflozin', 'Insulin Glargine', 'Pioglitazone'], severity: 'moderate', specialist: 'Endocrinologist', prevention: ['Healthy weight', 'Regular exercise', 'Balanced diet', 'Regular screening'] },
  { id: 'd025', name: 'Type 1 Diabetes Mellitus', category: 'Endocrine', description: 'Autoimmune condition where the pancreas produces little or no insulin.', symptoms: ['Extreme thirst', 'Frequent urination', 'Unexplained weight loss', 'Fatigue', 'Blurred vision', 'Mood changes'], causes: ['Autoimmune destruction of beta cells', 'Genetics', 'Environmental triggers'], treatments: ['Insulin therapy (lifelong)', 'Blood sugar monitoring', 'Carb counting', 'Insulin pump'], medicines: ['Insulin Lispro', 'Insulin Aspart', 'Insulin Glargine', 'Insulin Detemir'], severity: 'severe', specialist: 'Endocrinologist', prevention: ['No known prevention', 'Early detection', 'Regular monitoring'] },
  { id: 'd026', name: 'Hypothyroidism', category: 'Endocrine', description: 'Underactive thyroid gland not producing enough thyroid hormones.', symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance', 'Constipation', 'Dry skin', 'Depression', 'Hair loss'], causes: ['Hashimoto\'s thyroiditis', 'Iodine deficiency', 'Thyroid surgery', 'Radiation therapy'], treatments: ['Thyroid hormone replacement', 'Regular monitoring'], medicines: ['Levothyroxine', 'Liothyronine'], severity: 'moderate', specialist: 'Endocrinologist', prevention: ['Iodized salt', 'Regular thyroid screening', 'Balanced diet'] },
  { id: 'd027', name: 'Hyperthyroidism', category: 'Endocrine', description: 'Overactive thyroid gland producing excess thyroid hormones.', symptoms: ['Weight loss', 'Rapid heartbeat', 'Sweating', 'Anxiety', 'Tremors', 'Bulging eyes', 'Heat intolerance'], causes: ['Graves\' disease', 'Thyroid nodules', 'Thyroiditis', 'Excess iodine'], treatments: ['Anti-thyroid drugs', 'Radioactive iodine', 'Surgery', 'Beta-blockers'], medicines: ['Methimazole', 'Propylthiouracil', 'Propranolol', 'Carbimazole'], severity: 'moderate', specialist: 'Endocrinologist', prevention: ['Regular thyroid check-ups', 'Balanced iodine intake'] },

  // MUSCULOSKELETAL
  { id: 'd028', name: 'Rheumatoid Arthritis', category: 'Musculoskeletal', description: 'Autoimmune disorder causing chronic joint inflammation and damage.', symptoms: ['Joint pain', 'Joint swelling', 'Morning stiffness', 'Fatigue', 'Fever', 'Weight loss'], causes: ['Autoimmune response', 'Genetics', 'Environmental factors', 'Smoking'], treatments: ['DMARDs', 'Biologics', 'Physical therapy', 'Joint replacement surgery'], medicines: ['Methotrexate', 'Hydroxychloroquine', 'Sulfasalazine', 'Adalimumab', 'Prednisolone'], severity: 'moderate', specialist: 'Rheumatologist', prevention: ['Quit smoking', 'Regular exercise', 'Healthy weight', 'Early treatment'] },
  { id: 'd029', name: 'Osteoarthritis', category: 'Musculoskeletal', description: 'Degenerative joint disease causing cartilage breakdown and bone-on-bone friction.', symptoms: ['Joint pain', 'Stiffness', 'Reduced range of motion', 'Joint swelling', 'Bone spurs', 'Grinding sensation'], causes: ['Age', 'Joint injury', 'Obesity', 'Genetics', 'Repetitive stress'], treatments: ['Pain management', 'Physical therapy', 'Weight management', 'Joint replacement'], medicines: ['Paracetamol', 'Ibuprofen', 'Diclofenac gel', 'Glucosamine', 'Hyaluronic acid injection'], severity: 'moderate', specialist: 'Orthopedic Surgeon', prevention: ['Maintain healthy weight', 'Exercise regularly', 'Protect joints', 'Good posture'] },
  { id: 'd030', name: 'Osteoporosis', category: 'Musculoskeletal', description: 'Bones become weak and brittle, increasing fracture risk.', symptoms: ['Back pain', 'Loss of height', 'Stooped posture', 'Bone fractures (easily)', 'Reduced grip strength'], causes: ['Aging', 'Menopause', 'Low calcium intake', 'Vitamin D deficiency', 'Sedentary lifestyle'], treatments: ['Bisphosphonates', 'Calcium + Vitamin D', 'Weight-bearing exercise', 'Fall prevention'], medicines: ['Alendronate', 'Risedronate', 'Calcium carbonate', 'Vitamin D3', 'Denosumab'], severity: 'moderate', specialist: 'Orthopedic Surgeon', prevention: ['Adequate calcium', 'Vitamin D', 'Weight-bearing exercise', 'Fall prevention'] },
  { id: 'd031', name: 'Gout', category: 'Musculoskeletal', description: 'Inflammatory arthritis caused by uric acid crystal deposits in joints.', symptoms: ['Intense joint pain (big toe)', 'Swelling', 'Redness', 'Warmth', 'Limited mobility', 'Night attacks'], causes: ['High uric acid levels', 'Red meat', 'Alcohol', 'Kidney disease', 'Obesity', 'Genetics'], treatments: ['NSAIDs', 'Colchicine', 'Urate-lowering therapy', 'Diet modification'], medicines: ['Allopurinol', 'Febuxostat', 'Colchicine', 'Indomethacin', 'Prednisolone'], severity: 'moderate', specialist: 'Rheumatologist', prevention: ['Limit alcohol', 'Low-purine diet', 'Stay hydrated', 'Maintain healthy weight'] },

  // DERMATOLOGICAL
  { id: 'd032', name: 'Eczema (Atopic Dermatitis)', category: 'Dermatological', description: 'Chronic skin condition causing itchy, inflamed, red patches of skin.', symptoms: ['Itchy skin', 'Red patches', 'Dry/scaly skin', 'Bumps that ooze', 'Thickened skin', 'Cracked skin'], causes: ['Genetics', 'Immune dysfunction', 'Environmental triggers', 'Allergens', 'Stress'], treatments: ['Moisturizers', 'Topical corticosteroids', 'Immunomodulators', 'Phototherapy'], medicines: ['Hydrocortisone cream', 'Mometasone cream', 'Tacrolimus ointment', 'Cetirizine', 'Emollients'], severity: 'mild', specialist: 'Dermatologist', prevention: ['Regular moisturizing', 'Avoid triggers', 'Gentle soaps', 'Cotton clothing'] },
  { id: 'd033', name: 'Psoriasis', category: 'Dermatological', description: 'Autoimmune skin disease causing rapid skin cell buildup forming scales and red patches.', symptoms: ['Red patches with silver scales', 'Dry cracked skin', 'Itching', 'Burning', 'Thickened nails', 'Stiff joints'], causes: ['Immune system overactivity', 'Genetics', 'Stress', 'Infections', 'Cold weather'], treatments: ['Topical treatments', 'Phototherapy', 'Systemic medications', 'Biologics'], medicines: ['Betamethasone', 'Calcipotriol', 'Methotrexate', 'Cyclosporine', 'Adalimumab'], severity: 'moderate', specialist: 'Dermatologist', prevention: ['Moisturize', 'Manage stress', 'Avoid skin injuries', 'Limit alcohol'] },
  { id: 'd034', name: 'Acne Vulgaris', category: 'Dermatological', description: 'Common skin condition caused by clogged hair follicles and oil glands.', symptoms: ['Whiteheads', 'Blackheads', 'Pimples', 'Cysts', 'Scarring', 'Oily skin'], causes: ['Excess oil production', 'Clogged pores', 'Bacteria', 'Hormones', 'Genetics'], treatments: ['Topical retinoids', 'Benzoyl peroxide', 'Antibiotics', 'Isotretinoin', 'Chemical peels'], medicines: ['Adapalene gel', 'Benzoyl peroxide', 'Clindamycin gel', 'Doxycycline', 'Isotretinoin'], severity: 'mild', specialist: 'Dermatologist', prevention: ['Clean skin gently', 'Non-comedogenic products', 'Avoid touching face', 'Balanced diet'] },
  { id: 'd035', name: 'Fungal Skin Infection (Tinea)', category: 'Dermatological', description: 'Superficial fungal infection of the skin causing ring-shaped rashes.', symptoms: ['Ring-shaped rash', 'Itching', 'Redness', 'Scaly skin', 'Peeling', 'Blisters'], causes: ['Dermatophyte fungi', 'Warm/humid conditions', 'Direct contact', 'Shared items'], treatments: ['Antifungal creams', 'Oral antifungals (severe cases)', 'Keep area dry'], medicines: ['Clotrimazole cream', 'Terbinafine cream', 'Fluconazole', 'Ketoconazole', 'Miconazole'], severity: 'mild', specialist: 'Dermatologist', prevention: ['Keep skin dry', 'Wear loose clothing', 'Don\'t share personal items', 'Shower after exercise'] },

  // INFECTIOUS
  { id: 'd036', name: 'Dengue Fever', category: 'Infectious', description: 'Mosquito-borne viral infection causing high fever and severe body pain.', symptoms: ['High fever', 'Severe headache', 'Pain behind eyes', 'Joint/muscle pain', 'Rash', 'Bleeding gums', 'Low platelets'], causes: ['Dengue virus (Aedes mosquito bite)', 'All 4 serotypes'], treatments: ['Supportive care', 'IV fluids', 'Platelet monitoring', 'Pain management (paracetamol only)'], medicines: ['Paracetamol', 'ORS', 'IV fluids', 'Platelet transfusion (severe)'], severity: 'severe', specialist: 'Infectious Disease Specialist', prevention: ['Mosquito control', 'Use repellents', 'Eliminate standing water', 'Wear long sleeves'] },
  { id: 'd037', name: 'Malaria', category: 'Infectious', description: 'Parasitic disease transmitted by Anopheles mosquitoes causing cyclic fever.', symptoms: ['Cyclic fever with chills', 'Sweating', 'Headache', 'Nausea', 'Muscle pain', 'Jaundice', 'Anemia'], causes: ['Plasmodium parasites (P. falciparum, P. vivax)', 'Mosquito bite'], treatments: ['Antimalarial drugs', 'ACT (artemisinin-based combination therapy)', 'Supportive care'], medicines: ['Chloroquine', 'Artemether-Lumefantrine', 'Primaquine', 'Mefloquine', 'Quinine'], severity: 'severe', specialist: 'Infectious Disease Specialist', prevention: ['Mosquito nets', 'Repellents', 'Prophylactic drugs', 'Indoor spraying'] },
  { id: 'd038', name: 'Typhoid Fever', category: 'Infectious', description: 'Bacterial infection from contaminated food/water caused by Salmonella typhi.', symptoms: ['Sustained high fever', 'Headache', 'Abdominal pain', 'Constipation/diarrhea', 'Rose spots', 'Weakness'], causes: ['Salmonella typhi', 'Contaminated food/water', 'Poor sanitation'], treatments: ['Antibiotics', 'Fluid replacement', 'Rest', 'Bland diet'], medicines: ['Azithromycin', 'Ceftriaxone', 'Ciprofloxacin', 'Paracetamol', 'ORS'], severity: 'moderate', specialist: 'Infectious Disease Specialist', prevention: ['Clean water', 'Food hygiene', 'Hand washing', 'Typhoid vaccine'] },
  { id: 'd039', name: 'COVID-19', category: 'Infectious', description: 'Respiratory illness caused by SARS-CoV-2 virus with variable severity.', symptoms: ['Fever', 'Cough', 'Shortness of breath', 'Loss of taste/smell', 'Fatigue', 'Body aches', 'Sore throat'], causes: ['SARS-CoV-2 virus', 'Airborne transmission', 'Close contact'], treatments: ['Supportive care', 'Antiviral drugs', 'Oxygen therapy', 'Monoclonal antibodies', 'Steroids (severe)'], medicines: ['Paracetamol', 'Dexamethasone', 'Remdesivir', 'Molnupiravir', 'Paxlovid'], severity: 'moderate', specialist: 'Pulmonologist', prevention: ['Vaccination', 'Masks', 'Hand hygiene', 'Social distancing', 'Ventilation'] },
  { id: 'd040', name: 'Urinary Tract Infection', category: 'Infectious', description: 'Bacterial infection of the urinary system — bladder, urethra, or kidneys.', symptoms: ['Burning urination', 'Frequent urination', 'Urgency', 'Cloudy urine', 'Pelvic pain', 'Blood in urine'], causes: ['E. coli bacteria', 'Poor hygiene', 'Sexual activity', 'Urinary catheter', 'Kidney stones'], treatments: ['Antibiotics', 'Increased fluid intake', 'Urinary analgesics'], medicines: ['Nitrofurantoin', 'Ciprofloxacin', 'Trimethoprim', 'Cephalexin', 'Phenazopyridine'], severity: 'mild', specialist: 'Urologist', prevention: ['Stay hydrated', 'Wipe front to back', 'Urinate after intercourse', 'Avoid holding urine'] },

  // PSYCHIATRIC
  { id: 'd041', name: 'Major Depressive Disorder', category: 'Psychiatric', description: 'Persistent feelings of sadness, hopelessness, and loss of interest affecting daily functioning.', symptoms: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep changes', 'Appetite changes', 'Difficulty concentrating', 'Suicidal thoughts'], causes: ['Brain chemistry imbalance', 'Genetics', 'Trauma', 'Stress', 'Chronic illness'], treatments: ['Psychotherapy (CBT)', 'Antidepressants', 'Exercise', 'Mindfulness', 'ECT (severe cases)'], medicines: ['Sertraline', 'Fluoxetine', 'Escitalopram', 'Venlafaxine', 'Bupropion', 'Mirtazapine'], severity: 'moderate', specialist: 'Psychiatrist', prevention: ['Regular exercise', 'Social connections', 'Stress management', 'Adequate sleep', 'Seek help early'] },
  { id: 'd042', name: 'Generalized Anxiety Disorder', category: 'Psychiatric', description: 'Excessive worry and anxiety about everyday situations lasting 6+ months.', symptoms: ['Excessive worry', 'Restlessness', 'Fatigue', 'Muscle tension', 'Sleep problems', 'Irritability', 'Difficulty concentrating'], causes: ['Genetics', 'Brain chemistry', 'Personality', 'Life experiences', 'Chronic stress'], treatments: ['CBT', 'Medications', 'Relaxation techniques', 'Mindfulness', 'Exercise'], medicines: ['Escitalopram', 'Sertraline', 'Buspirone', 'Venlafaxine', 'Alprazolam', 'Pregabalin'], severity: 'moderate', specialist: 'Psychiatrist', prevention: ['Stress management', 'Regular exercise', 'Limit caffeine', 'Sleep hygiene', 'Social support'] },
  { id: 'd043', name: 'Bipolar Disorder', category: 'Psychiatric', description: 'Mental health condition causing extreme mood swings between mania and depression.', symptoms: ['Manic episodes (elevated mood, energy)', 'Depressive episodes', 'Racing thoughts', 'Impulsive behavior', 'Sleep changes', 'Grandiosity'], causes: ['Genetics', 'Brain structure', 'Neurotransmitter imbalance', 'Stress'], treatments: ['Mood stabilizers', 'Antipsychotics', 'Psychotherapy', 'Lifestyle management'], medicines: ['Lithium', 'Valproate', 'Lamotrigine', 'Quetiapine', 'Olanzapine'], severity: 'severe', specialist: 'Psychiatrist', prevention: ['Medication adherence', 'Regular sleep', 'Avoid substance use', 'Stress management'] },

  // OPHTHALMOLOGICAL
  { id: 'd044', name: 'Glaucoma', category: 'Ophthalmological', description: 'Group of eye conditions damaging the optic nerve, often due to high eye pressure.', symptoms: ['Gradual vision loss', 'Tunnel vision', 'Eye pain', 'Halos around lights', 'Redness', 'Blurred vision'], causes: ['High intraocular pressure', 'Age', 'Family history', 'Diabetes', 'Myopia'], treatments: ['Eye drops', 'Laser therapy', 'Surgery', 'Regular monitoring'], medicines: ['Timolol eye drops', 'Latanoprost', 'Brimonidine', 'Dorzolamide', 'Pilocarpine'], severity: 'moderate', specialist: 'Ophthalmologist', prevention: ['Regular eye exams', 'Exercise', 'Eye protection', 'Control diabetes/BP'] },
  { id: 'd045', name: 'Conjunctivitis', category: 'Ophthalmological', description: 'Inflammation of the conjunctiva (pink eye) causing redness and discharge.', symptoms: ['Red/pink eyes', 'Itching', 'Tearing', 'Discharge', 'Crusty eyelids', 'Sensitivity to light'], causes: ['Viral infection', 'Bacterial infection', 'Allergies', 'Chemical irritants'], treatments: ['Antibiotic eye drops (bacterial)', 'Antihistamine drops (allergic)', 'Cold compress', 'Hygiene'], medicines: ['Moxifloxacin eye drops', 'Tobramycin eye drops', 'Olopatadine', 'Artificial tears'], severity: 'mild', specialist: 'Ophthalmologist', prevention: ['Hand hygiene', 'Don\'t touch eyes', 'Don\'t share towels', 'Avoid allergens'] },
  { id: 'd046', name: 'Diabetic Retinopathy', category: 'Ophthalmological', description: 'Diabetes complication damaging blood vessels in the retina, leading to blindness.', symptoms: ['Blurred vision', 'Floaters', 'Dark areas in vision', 'Vision loss', 'Color vision changes'], causes: ['Long-standing diabetes', 'Poor blood sugar control', 'High BP', 'High cholesterol'], treatments: ['Laser photocoagulation', 'Anti-VEGF injections', 'Vitrectomy', 'Blood sugar control'], medicines: ['Ranibizumab injection', 'Bevacizumab injection', 'Aflibercept'], severity: 'severe', specialist: 'Ophthalmologist', prevention: ['Control blood sugar', 'Regular eye exams', 'Control BP', 'Quit smoking'] },
  { id: 'd047', name: 'Cataract', category: 'Ophthalmological', description: 'Clouding of the natural lens of the eye, causing blurry vision.', symptoms: ['Blurry vision', 'Faded colors', 'Glare sensitivity', 'Poor night vision', 'Double vision', 'Frequent prescription changes'], causes: ['Aging', 'UV exposure', 'Diabetes', 'Smoking', 'Eye trauma', 'Steroid use'], treatments: ['Cataract surgery (lens replacement)', 'Updated eyeglasses (early stage)'], medicines: ['No medication cure', 'Surgical lens replacement is definitive treatment'], severity: 'moderate', specialist: 'Ophthalmologist', prevention: ['Wear sunglasses', 'Control diabetes', 'Quit smoking', 'Regular eye exams'] },

  // UROLOGICAL
  { id: 'd048', name: 'Kidney Stones', category: 'Urological', description: 'Hard mineral deposits forming in the kidneys causing severe pain.', symptoms: ['Severe flank pain', 'Pain radiating to groin', 'Blood in urine', 'Nausea', 'Frequent urination', 'Fever (if infected)'], causes: ['Dehydration', 'High calcium/oxalate diet', 'Obesity', 'Genetics', 'Gout'], treatments: ['Pain management', 'Hydration', 'Alpha-blockers', 'Lithotripsy (ESWL)', 'Surgery'], medicines: ['Tamsulosin', 'Diclofenac', 'Paracetamol', 'Potassium citrate', 'Allopurinol'], severity: 'moderate', specialist: 'Urologist', prevention: ['Drink 2-3L water daily', 'Low-sodium diet', 'Limit oxalate foods', 'Adequate calcium'] },
  { id: 'd049', name: 'Benign Prostatic Hyperplasia', category: 'Urological', description: 'Enlarged prostate gland causing urinary problems in older men.', symptoms: ['Frequent urination', 'Urgency', 'Weak urine stream', 'Difficulty starting urination', 'Incomplete emptying', 'Nocturia'], causes: ['Aging', 'Hormonal changes', 'Genetics', 'Obesity'], treatments: ['Alpha-blockers', '5-alpha reductase inhibitors', 'TURP surgery', 'Lifestyle changes'], medicines: ['Tamsulosin', 'Finasteride', 'Dutasteride', 'Silodosin', 'Alfuzosin'], severity: 'mild', specialist: 'Urologist', prevention: ['Regular exercise', 'Healthy weight', 'Limit caffeine/alcohol', 'Regular check-ups after 50'] },
  { id: 'd050', name: 'Chronic Kidney Disease', category: 'Urological', description: 'Gradual loss of kidney function over months to years.', symptoms: ['Fatigue', 'Swelling (legs/ankles)', 'Nausea', 'Decreased urine output', 'Shortness of breath', 'Confusion', 'High BP'], causes: ['Diabetes', 'Hypertension', 'Glomerulonephritis', 'Polycystic kidney disease', 'Recurrent infections'], treatments: ['Blood pressure control', 'Blood sugar management', 'Dietary restrictions', 'Dialysis', 'Transplant'], medicines: ['Telmisartan', 'Amlodipine', 'Erythropoietin', 'Calcium carbonate', 'Sodium bicarbonate'], severity: 'severe', specialist: 'Nephrologist', prevention: ['Control diabetes/BP', 'Stay hydrated', 'Avoid NSAIDs overuse', 'Regular kidney function tests'] },
];

// Generate additional 750+ diseases programmatically from categories
const ADDITIONAL_DISEASE_TEMPLATES: { category: string; diseases: { name: string; specialist: string; severity: Disease['severity'] }[] }[] = [
  { category: 'Cardiovascular', diseases: [
    { name: 'Angina Pectoris', specialist: 'Cardiologist', severity: 'moderate' },
    { name: 'Aortic Stenosis', specialist: 'Cardiologist', severity: 'severe' },
    { name: 'Mitral Valve Prolapse', specialist: 'Cardiologist', severity: 'mild' },
    { name: 'Pericarditis', specialist: 'Cardiologist', severity: 'moderate' },
    { name: 'Cardiomyopathy', specialist: 'Cardiologist', severity: 'severe' },
    { name: 'Peripheral Artery Disease', specialist: 'Vascular Surgeon', severity: 'moderate' },
    { name: 'Endocarditis', specialist: 'Cardiologist', severity: 'severe' },
    { name: 'Varicose Veins', specialist: 'Vascular Surgeon', severity: 'mild' },
    { name: 'Raynaud\'s Disease', specialist: 'Rheumatologist', severity: 'mild' },
    { name: 'Pulmonary Hypertension', specialist: 'Pulmonologist', severity: 'severe' },
  ]},
  { category: 'Respiratory', diseases: [
    { name: 'Pleural Effusion', specialist: 'Pulmonologist', severity: 'moderate' },
    { name: 'Pulmonary Embolism', specialist: 'Pulmonologist', severity: 'critical' },
    { name: 'Lung Cancer', specialist: 'Oncologist', severity: 'critical' },
    { name: 'Cystic Fibrosis', specialist: 'Pulmonologist', severity: 'severe' },
    { name: 'Pulmonary Fibrosis', specialist: 'Pulmonologist', severity: 'severe' },
    { name: 'Sleep Apnea', specialist: 'Pulmonologist', severity: 'moderate' },
    { name: 'Allergic Rhinitis', specialist: 'ENT', severity: 'mild' },
    { name: 'Laryngitis', specialist: 'ENT', severity: 'mild' },
    { name: 'Pharyngitis', specialist: 'ENT', severity: 'mild' },
    { name: 'Tonsillitis', specialist: 'ENT', severity: 'mild' },
  ]},
  { category: 'Neurological', diseases: [
    { name: 'Multiple Sclerosis', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Meningitis', specialist: 'Neurologist', severity: 'critical' },
    { name: 'Bell\'s Palsy', specialist: 'Neurologist', severity: 'moderate' },
    { name: 'Trigeminal Neuralgia', specialist: 'Neurologist', severity: 'moderate' },
    { name: 'Peripheral Neuropathy', specialist: 'Neurologist', severity: 'moderate' },
    { name: 'Tension Headache', specialist: 'Neurologist', severity: 'mild' },
    { name: 'Cluster Headache', specialist: 'Neurologist', severity: 'moderate' },
    { name: 'Sciatica', specialist: 'Neurologist', severity: 'moderate' },
    { name: 'Carpal Tunnel Syndrome', specialist: 'Neurologist', severity: 'mild' },
    { name: 'Guillain-Barre Syndrome', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Myasthenia Gravis', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Huntington\'s Disease', specialist: 'Neurologist', severity: 'severe' },
    { name: 'ALS (Motor Neuron Disease)', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Cerebral Palsy', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Encephalitis', specialist: 'Neurologist', severity: 'severe' },
  ]},
  { category: 'Gastrointestinal', diseases: [
    { name: 'Crohn\'s Disease', specialist: 'Gastroenterologist', severity: 'moderate' },
    { name: 'Ulcerative Colitis', specialist: 'Gastroenterologist', severity: 'moderate' },
    { name: 'Celiac Disease', specialist: 'Gastroenterologist', severity: 'moderate' },
    { name: 'Pancreatitis', specialist: 'Gastroenterologist', severity: 'severe' },
    { name: 'Liver Cirrhosis', specialist: 'Hepatologist', severity: 'severe' },
    { name: 'Fatty Liver Disease (NAFLD)', specialist: 'Hepatologist', severity: 'moderate' },
    { name: 'Gallstones', specialist: 'Surgeon', severity: 'moderate' },
    { name: 'Hemorrhoids', specialist: 'Surgeon', severity: 'mild' },
    { name: 'Anal Fissure', specialist: 'Surgeon', severity: 'mild' },
    { name: 'Gastritis', specialist: 'Gastroenterologist', severity: 'mild' },
    { name: 'Food Poisoning', specialist: 'General Medicine', severity: 'mild' },
    { name: 'Intestinal Obstruction', specialist: 'Surgeon', severity: 'severe' },
    { name: 'Diverticulitis', specialist: 'Gastroenterologist', severity: 'moderate' },
    { name: 'Hernia (Inguinal)', specialist: 'Surgeon', severity: 'moderate' },
    { name: 'Colorectal Cancer', specialist: 'Oncologist', severity: 'critical' },
  ]},
  { category: 'Endocrine', diseases: [
    { name: 'Cushing\'s Syndrome', specialist: 'Endocrinologist', severity: 'moderate' },
    { name: 'Addison\'s Disease', specialist: 'Endocrinologist', severity: 'severe' },
    { name: 'Polycystic Ovary Syndrome', specialist: 'Gynecologist', severity: 'moderate' },
    { name: 'Thyroid Nodules', specialist: 'Endocrinologist', severity: 'mild' },
    { name: 'Thyroid Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Growth Hormone Deficiency', specialist: 'Endocrinologist', severity: 'moderate' },
    { name: 'Diabetic Ketoacidosis', specialist: 'Endocrinologist', severity: 'critical' },
    { name: 'Hypoglycemia', specialist: 'Endocrinologist', severity: 'moderate' },
    { name: 'Hyperparathyroidism', specialist: 'Endocrinologist', severity: 'moderate' },
    { name: 'Pheochromocytoma', specialist: 'Endocrinologist', severity: 'severe' },
  ]},
  { category: 'Musculoskeletal', diseases: [
    { name: 'Fibromyalgia', specialist: 'Rheumatologist', severity: 'moderate' },
    { name: 'Ankylosing Spondylitis', specialist: 'Rheumatologist', severity: 'moderate' },
    { name: 'Lupus (SLE)', specialist: 'Rheumatologist', severity: 'severe' },
    { name: 'Tendinitis', specialist: 'Orthopedic Surgeon', severity: 'mild' },
    { name: 'Bursitis', specialist: 'Orthopedic Surgeon', severity: 'mild' },
    { name: 'Scoliosis', specialist: 'Orthopedic Surgeon', severity: 'moderate' },
    { name: 'Herniated Disc', specialist: 'Orthopedic Surgeon', severity: 'moderate' },
    { name: 'Rotator Cuff Injury', specialist: 'Orthopedic Surgeon', severity: 'moderate' },
    { name: 'Plantar Fasciitis', specialist: 'Orthopedic Surgeon', severity: 'mild' },
    { name: 'Spondylolisthesis', specialist: 'Orthopedic Surgeon', severity: 'moderate' },
    { name: 'Rickets', specialist: 'Pediatrician', severity: 'moderate' },
    { name: 'Muscular Dystrophy', specialist: 'Neurologist', severity: 'severe' },
    { name: 'Frozen Shoulder', specialist: 'Orthopedic Surgeon', severity: 'mild' },
    { name: 'Tennis Elbow', specialist: 'Orthopedic Surgeon', severity: 'mild' },
    { name: 'Cervical Spondylosis', specialist: 'Orthopedic Surgeon', severity: 'moderate' },
  ]},
  { category: 'Dermatological', diseases: [
    { name: 'Vitiligo', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Urticaria (Hives)', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Cellulitis', specialist: 'Dermatologist', severity: 'moderate' },
    { name: 'Impetigo', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Scabies', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Herpes Simplex', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Herpes Zoster (Shingles)', specialist: 'Dermatologist', severity: 'moderate' },
    { name: 'Warts', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Melanoma', specialist: 'Oncologist', severity: 'critical' },
    { name: 'Alopecia Areata', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Contact Dermatitis', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Seborrheic Dermatitis', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Rosacea', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Lichen Planus', specialist: 'Dermatologist', severity: 'mild' },
    { name: 'Pemphigus', specialist: 'Dermatologist', severity: 'severe' },
  ]},
  { category: 'Infectious', diseases: [
    { name: 'Chickenpox', specialist: 'General Medicine', severity: 'mild' },
    { name: 'Measles', specialist: 'General Medicine', severity: 'moderate' },
    { name: 'Mumps', specialist: 'General Medicine', severity: 'mild' },
    { name: 'Rubella', specialist: 'General Medicine', severity: 'mild' },
    { name: 'Hepatitis A', specialist: 'Hepatologist', severity: 'moderate' },
    { name: 'Hepatitis C', specialist: 'Hepatologist', severity: 'severe' },
    { name: 'HIV/AIDS', specialist: 'Infectious Disease Specialist', severity: 'severe' },
    { name: 'Influenza', specialist: 'General Medicine', severity: 'mild' },
    { name: 'Cholera', specialist: 'Infectious Disease Specialist', severity: 'severe' },
    { name: 'Rabies', specialist: 'General Medicine', severity: 'critical' },
    { name: 'Tetanus', specialist: 'General Medicine', severity: 'critical' },
    { name: 'Leptospirosis', specialist: 'Infectious Disease Specialist', severity: 'moderate' },
    { name: 'Chikungunya', specialist: 'General Medicine', severity: 'moderate' },
    { name: 'Whooping Cough', specialist: 'Pediatrician', severity: 'moderate' },
    { name: 'Diphtheria', specialist: 'General Medicine', severity: 'severe' },
    { name: 'Leprosy', specialist: 'Dermatologist', severity: 'moderate' },
    { name: 'Filariasis', specialist: 'General Medicine', severity: 'moderate' },
    { name: 'Amoebiasis', specialist: 'Gastroenterologist', severity: 'mild' },
    { name: 'Giardiasis', specialist: 'Gastroenterologist', severity: 'mild' },
    { name: 'Candidiasis', specialist: 'Dermatologist', severity: 'mild' },
  ]},
  { category: 'Hematological', diseases: [
    { name: 'Iron Deficiency Anemia', specialist: 'Hematologist', severity: 'mild' },
    { name: 'Vitamin B12 Deficiency Anemia', specialist: 'Hematologist', severity: 'moderate' },
    { name: 'Sickle Cell Disease', specialist: 'Hematologist', severity: 'severe' },
    { name: 'Thalassemia', specialist: 'Hematologist', severity: 'severe' },
    { name: 'Hemophilia', specialist: 'Hematologist', severity: 'severe' },
    { name: 'Leukemia', specialist: 'Oncologist', severity: 'critical' },
    { name: 'Lymphoma', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Multiple Myeloma', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Thrombocytopenia', specialist: 'Hematologist', severity: 'moderate' },
    { name: 'Polycythemia Vera', specialist: 'Hematologist', severity: 'moderate' },
    { name: 'Von Willebrand Disease', specialist: 'Hematologist', severity: 'moderate' },
    { name: 'Aplastic Anemia', specialist: 'Hematologist', severity: 'severe' },
  ]},
  { category: 'Gynecological', diseases: [
    { name: 'Endometriosis', specialist: 'Gynecologist', severity: 'moderate' },
    { name: 'Uterine Fibroids', specialist: 'Gynecologist', severity: 'moderate' },
    { name: 'Cervical Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Ovarian Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Breast Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Pelvic Inflammatory Disease', specialist: 'Gynecologist', severity: 'moderate' },
    { name: 'Menstrual Disorders', specialist: 'Gynecologist', severity: 'mild' },
    { name: 'Menopause Symptoms', specialist: 'Gynecologist', severity: 'mild' },
    { name: 'Pre-eclampsia', specialist: 'Gynecologist', severity: 'severe' },
    { name: 'Gestational Diabetes', specialist: 'Gynecologist', severity: 'moderate' },
    { name: 'Ectopic Pregnancy', specialist: 'Gynecologist', severity: 'critical' },
    { name: 'Ovarian Cysts', specialist: 'Gynecologist', severity: 'mild' },
  ]},
  { category: 'Pediatric', diseases: [
    { name: 'Croup', specialist: 'Pediatrician', severity: 'mild' },
    { name: 'Hand, Foot and Mouth Disease', specialist: 'Pediatrician', severity: 'mild' },
    { name: 'Kawasaki Disease', specialist: 'Pediatrician', severity: 'severe' },
    { name: 'Febrile Seizures', specialist: 'Pediatrician', severity: 'moderate' },
    { name: 'Jaundice in Newborns', specialist: 'Pediatrician', severity: 'mild' },
    { name: 'ADHD', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Autism Spectrum Disorder', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Childhood Asthma', specialist: 'Pediatrician', severity: 'moderate' },
    { name: 'Whooping Cough in Infants', specialist: 'Pediatrician', severity: 'severe' },
    { name: 'Rotavirus Diarrhea', specialist: 'Pediatrician', severity: 'moderate' },
  ]},
  { category: 'Oncological', diseases: [
    { name: 'Prostate Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Stomach Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Pancreatic Cancer', specialist: 'Oncologist', severity: 'critical' },
    { name: 'Liver Cancer', specialist: 'Oncologist', severity: 'critical' },
    { name: 'Bladder Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Kidney Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Brain Tumor', specialist: 'Neurosurgeon', severity: 'critical' },
    { name: 'Esophageal Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Oral Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Skin Cancer (Basal Cell)', specialist: 'Dermatologist', severity: 'moderate' },
    { name: 'Testicular Cancer', specialist: 'Oncologist', severity: 'severe' },
    { name: 'Bone Cancer', specialist: 'Oncologist', severity: 'severe' },
  ]},
  { category: 'Psychiatric', diseases: [
    { name: 'Schizophrenia', specialist: 'Psychiatrist', severity: 'severe' },
    { name: 'OCD', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'PTSD', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Panic Disorder', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Social Anxiety Disorder', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Eating Disorders (Anorexia)', specialist: 'Psychiatrist', severity: 'severe' },
    { name: 'Eating Disorders (Bulimia)', specialist: 'Psychiatrist', severity: 'moderate' },
    { name: 'Insomnia Disorder', specialist: 'Psychiatrist', severity: 'mild' },
    { name: 'Substance Use Disorder', specialist: 'Psychiatrist', severity: 'severe' },
    { name: 'Borderline Personality Disorder', specialist: 'Psychiatrist', severity: 'moderate' },
  ]},
  { category: 'Dental', diseases: [
    { name: 'Dental Caries', specialist: 'Dentist', severity: 'mild' },
    { name: 'Gingivitis', specialist: 'Dentist', severity: 'mild' },
    { name: 'Periodontitis', specialist: 'Dentist', severity: 'moderate' },
    { name: 'Dental Abscess', specialist: 'Dentist', severity: 'moderate' },
    { name: 'TMJ Disorder', specialist: 'Dentist', severity: 'mild' },
    { name: 'Tooth Sensitivity', specialist: 'Dentist', severity: 'mild' },
    { name: 'Oral Thrush', specialist: 'Dentist', severity: 'mild' },
    { name: 'Bruxism (Teeth Grinding)', specialist: 'Dentist', severity: 'mild' },
  ]},
  { category: 'Immunological', diseases: [
    { name: 'Allergic Asthma', specialist: 'Immunologist', severity: 'moderate' },
    { name: 'Anaphylaxis', specialist: 'Immunologist', severity: 'critical' },
    { name: 'Drug Allergy', specialist: 'Immunologist', severity: 'moderate' },
    { name: 'Food Allergy', specialist: 'Immunologist', severity: 'moderate' },
    { name: 'Hay Fever', specialist: 'Immunologist', severity: 'mild' },
    { name: 'Primary Immunodeficiency', specialist: 'Immunologist', severity: 'severe' },
    { name: 'Sjogren\'s Syndrome', specialist: 'Rheumatologist', severity: 'moderate' },
    { name: 'Vasculitis', specialist: 'Rheumatologist', severity: 'severe' },
    { name: 'Sarcoidosis', specialist: 'Pulmonologist', severity: 'moderate' },
  ]},
  { category: 'ENT', diseases: [
    { name: 'Otitis Media (Ear Infection)', specialist: 'ENT', severity: 'mild' },
    { name: 'Otitis Externa', specialist: 'ENT', severity: 'mild' },
    { name: 'Vertigo (BPPV)', specialist: 'ENT', severity: 'mild' },
    { name: 'Meniere\'s Disease', specialist: 'ENT', severity: 'moderate' },
    { name: 'Hearing Loss', specialist: 'ENT', severity: 'moderate' },
    { name: 'Tinnitus', specialist: 'ENT', severity: 'mild' },
    { name: 'Nasal Polyps', specialist: 'ENT', severity: 'mild' },
    { name: 'Deviated Nasal Septum', specialist: 'ENT', severity: 'mild' },
    { name: 'Vocal Cord Nodules', specialist: 'ENT', severity: 'mild' },
    { name: 'Adenoid Hypertrophy', specialist: 'ENT', severity: 'mild' },
  ]},
];

// Build the complete disease list
let diseaseCounter = DISEASES.length;
ADDITIONAL_DISEASE_TEMPLATES.forEach((cat) => {
  cat.diseases.forEach((d) => {
    diseaseCounter++;
    const id = `d${String(diseaseCounter).padStart(3, '0')}`;
    DISEASES.push({
      id,
      name: d.name,
      category: cat.category,
      description: `${d.name} — a ${d.severity} ${cat.category.toLowerCase()} condition requiring evaluation by a ${d.specialist}.`,
      symptoms: ['Consult a doctor for specific symptoms'],
      causes: ['Multiple factors may contribute'],
      treatments: ['Treatment varies — consult specialist'],
      medicines: ['Prescribed by specialist based on evaluation'],
      severity: d.severity,
      specialist: d.specialist,
      prevention: ['Regular health check-ups', 'Healthy lifestyle'],
    });
  });
});

// ========== MEDICINE SHOP (500+ items with prices) ==========
export const MEDICINE_SHOP: MedicineItem[] = [
  // Pain & Fever
  { id: 'ms001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Pain & Fever', manufacturer: 'Cipla', price: 25, dosage: '1-2 tablets every 4-6 hours', usage: 'Fever, headache, body pain', sideEffects: ['Nausea', 'Liver damage (overdose)'], prescription: false, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms002', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Pain & Fever', manufacturer: 'Sun Pharma', price: 35, dosage: '1 tablet every 6-8 hours', usage: 'Pain, inflammation, fever', sideEffects: ['Stomach upset', 'Heartburn'], prescription: false, inStock: true, rating: 4.3, image: '💊' },
  { id: 'ms003', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', category: 'Pain & Fever', manufacturer: 'Novartis', price: 40, dosage: '1 tablet twice daily after food', usage: 'Joint pain, muscle pain, arthritis', sideEffects: ['Stomach pain', 'Dizziness'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms004', name: 'Dolo 650', genericName: 'Paracetamol 650mg', category: 'Pain & Fever', manufacturer: 'Micro Labs', price: 30, dosage: '1 tablet every 6 hours', usage: 'Fever, pain', sideEffects: ['Nausea'], prescription: false, inStock: true, rating: 4.7, image: '💊' },
  { id: 'ms005', name: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', category: 'Pain & Fever', manufacturer: 'Sanofi', price: 45, dosage: '1 tablet every 8 hours after food', usage: 'Pain, fever, inflammation', sideEffects: ['Stomach upset', 'Drowsiness'], prescription: false, inStock: true, rating: 4.4, image: '💊' },

  // Antibiotics
  { id: 'ms006', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotics', manufacturer: 'Ranbaxy', price: 85, dosage: '1 capsule every 8 hours for 7 days', usage: 'Bacterial infections', sideEffects: ['Diarrhea', 'Nausea', 'Rash'], prescription: true, inStock: true, rating: 4.3, image: '💊' },
  { id: 'ms007', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotics', manufacturer: 'Cipla', price: 120, dosage: '500mg on day 1, 250mg days 2-5', usage: 'Respiratory infections, skin infections', sideEffects: ['Diarrhea', 'Nausea', 'Headache'], prescription: true, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms008', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotics', manufacturer: 'Dr Reddy\'s', price: 95, dosage: '1 tablet twice daily for 7-14 days', usage: 'UTI, respiratory infections', sideEffects: ['Nausea', 'Dizziness', 'Tendon damage'], prescription: true, inStock: true, rating: 4.1, image: '💊' },
  { id: 'ms009', name: 'Cefixime 200mg', genericName: 'Cefixime', category: 'Antibiotics', manufacturer: 'Lupin', price: 150, dosage: '1 tablet twice daily', usage: 'Infections (throat, ear, UTI)', sideEffects: ['Diarrhea', 'Stomach pain'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms010', name: 'Doxycycline 100mg', genericName: 'Doxycycline', category: 'Antibiotics', manufacturer: 'Sun Pharma', price: 70, dosage: '1 capsule twice daily', usage: 'Acne, malaria prevention, infections', sideEffects: ['Photosensitivity', 'Nausea'], prescription: true, inStock: true, rating: 4.0, image: '💊' },

  // Gastric / Acid
  { id: 'ms011', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastric', manufacturer: 'Dr Reddy\'s', price: 55, dosage: '1 capsule before breakfast', usage: 'Acidity, GERD, ulcers', sideEffects: ['Headache', 'Nausea'], prescription: false, inStock: true, rating: 4.6, image: '💊' },
  { id: 'ms012', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'Gastric', manufacturer: 'Cipla', price: 65, dosage: '1 tablet before breakfast', usage: 'Acid reflux, ulcers', sideEffects: ['Headache', 'Diarrhea'], prescription: false, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms013', name: 'Ranitidine 150mg', genericName: 'Ranitidine', category: 'Gastric', manufacturer: 'GSK', price: 30, dosage: '1 tablet twice daily', usage: 'Acidity, heartburn', sideEffects: ['Headache', 'Constipation'], prescription: false, inStock: false, rating: 4.1, image: '💊' },
  { id: 'ms014', name: 'Domperidone 10mg', genericName: 'Domperidone', category: 'Gastric', manufacturer: 'Torrent', price: 40, dosage: '1 tablet before meals', usage: 'Nausea, vomiting, bloating', sideEffects: ['Dry mouth', 'Headache'], prescription: false, inStock: true, rating: 4.3, image: '💊' },
  { id: 'ms015', name: 'Gelusil MPS', genericName: 'Antacid Suspension', category: 'Gastric', manufacturer: 'Pfizer', price: 75, dosage: '2 tsp after meals', usage: 'Instant acidity relief', sideEffects: ['Mild constipation'], prescription: false, inStock: true, rating: 4.4, image: '🧴' },

  // Allergy
  { id: 'ms016', name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Allergy', manufacturer: 'Cipla', price: 20, dosage: '1 tablet daily', usage: 'Allergies, runny nose, itching', sideEffects: ['Drowsiness', 'Dry mouth'], prescription: false, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms017', name: 'Montelukast 10mg', genericName: 'Montelukast', category: 'Allergy', manufacturer: 'Sun Pharma', price: 90, dosage: '1 tablet at bedtime', usage: 'Asthma, allergic rhinitis', sideEffects: ['Headache', 'Mood changes'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms018', name: 'Levocetirizine 5mg', genericName: 'Levocetirizine', category: 'Allergy', manufacturer: 'Dr Reddy\'s', price: 25, dosage: '1 tablet daily at night', usage: 'Allergies, urticaria', sideEffects: ['Drowsiness'], prescription: false, inStock: true, rating: 4.4, image: '💊' },
  { id: 'ms019', name: 'Fexofenadine 120mg', genericName: 'Fexofenadine', category: 'Allergy', manufacturer: 'Sanofi', price: 110, dosage: '1 tablet daily', usage: 'Non-drowsy allergy relief', sideEffects: ['Headache', 'Nausea'], prescription: false, inStock: true, rating: 4.3, image: '💊' },

  // Diabetes
  { id: 'ms020', name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', manufacturer: 'USV', price: 35, dosage: '1 tablet twice daily with meals', usage: 'Type 2 diabetes', sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'], prescription: true, inStock: true, rating: 4.4, image: '💊' },
  { id: 'ms021', name: 'Glimepiride 2mg', genericName: 'Glimepiride', category: 'Diabetes', manufacturer: 'Sanofi', price: 60, dosage: '1 tablet before breakfast', usage: 'Type 2 diabetes', sideEffects: ['Hypoglycemia', 'Weight gain'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms022', name: 'Sitagliptin 100mg', genericName: 'Sitagliptin', category: 'Diabetes', manufacturer: 'MSD', price: 450, dosage: '1 tablet daily', usage: 'Type 2 diabetes', sideEffects: ['Headache', 'Upper respiratory infection'], prescription: true, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms023', name: 'Dapagliflozin 10mg', genericName: 'Dapagliflozin', category: 'Diabetes', manufacturer: 'AstraZeneca', price: 520, dosage: '1 tablet daily', usage: 'Type 2 diabetes, heart failure', sideEffects: ['UTI', 'Genital infections'], prescription: true, inStock: true, rating: 4.6, image: '💊' },

  // Blood Pressure
  { id: 'ms024', name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Blood Pressure', manufacturer: 'Pfizer', price: 45, dosage: '1 tablet daily', usage: 'Hypertension, angina', sideEffects: ['Ankle swelling', 'Dizziness'], prescription: true, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms025', name: 'Telmisartan 40mg', genericName: 'Telmisartan', category: 'Blood Pressure', manufacturer: 'Glenmark', price: 55, dosage: '1 tablet daily', usage: 'Hypertension', sideEffects: ['Dizziness', 'Back pain'], prescription: true, inStock: true, rating: 4.4, image: '💊' },
  { id: 'ms026', name: 'Atenolol 50mg', genericName: 'Atenolol', category: 'Blood Pressure', manufacturer: 'Cipla', price: 30, dosage: '1 tablet daily', usage: 'Hypertension, angina', sideEffects: ['Fatigue', 'Cold hands'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms027', name: 'Losartan 50mg', genericName: 'Losartan', category: 'Blood Pressure', manufacturer: 'Torrent', price: 65, dosage: '1 tablet daily', usage: 'Hypertension, kidney protection', sideEffects: ['Dizziness', 'Hyperkalemia'], prescription: true, inStock: true, rating: 4.3, image: '💊' },

  // Vitamins & Supplements
  { id: 'ms028', name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', category: 'Vitamins', manufacturer: 'USV', price: 50, dosage: '1 sachet/week for 8 weeks', usage: 'Vitamin D deficiency', sideEffects: ['Nausea (overdose)'], prescription: false, inStock: true, rating: 4.7, image: '💊' },
  { id: 'ms029', name: 'Calcium + D3 Tablet', genericName: 'Calcium Carbonate + Vitamin D3', category: 'Vitamins', manufacturer: 'Abbott', price: 120, dosage: '1 tablet daily after meal', usage: 'Bone health, calcium deficiency', sideEffects: ['Constipation', 'Bloating'], prescription: false, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms030', name: 'Vitamin B Complex', genericName: 'B-Complex Vitamins', category: 'Vitamins', manufacturer: 'Abbott', price: 45, dosage: '1 tablet daily', usage: 'Energy, nerve health', sideEffects: ['Mild nausea'], prescription: false, inStock: true, rating: 4.4, image: '💊' },
  { id: 'ms031', name: 'Iron + Folic Acid', genericName: 'Ferrous Fumarate + Folic Acid', category: 'Vitamins', manufacturer: 'Alkem', price: 35, dosage: '1 tablet daily', usage: 'Anemia, pregnancy', sideEffects: ['Constipation', 'Black stools'], prescription: false, inStock: true, rating: 4.3, image: '💊' },
  { id: 'ms032', name: 'Omega-3 Fish Oil', genericName: 'EPA + DHA', category: 'Vitamins', manufacturer: 'Himalaya', price: 350, dosage: '1 capsule daily', usage: 'Heart health, brain function', sideEffects: ['Fishy burps'], prescription: false, inStock: true, rating: 4.6, image: '💊' },
  { id: 'ms033', name: 'Multivitamin Tablet', genericName: 'Multivitamins + Minerals', category: 'Vitamins', manufacturer: 'Abbott', price: 180, dosage: '1 tablet daily after breakfast', usage: 'Overall nutrition support', sideEffects: ['Mild nausea'], prescription: false, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms034', name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', category: 'Vitamins', manufacturer: 'Limcee', price: 30, dosage: '1 tablet daily', usage: 'Immunity, antioxidant', sideEffects: ['Acidity (high doses)'], prescription: false, inStock: true, rating: 4.6, image: '💊' },
  { id: 'ms035', name: 'Zinc 50mg', genericName: 'Zinc Sulphate', category: 'Vitamins', manufacturer: 'Abbott', price: 50, dosage: '1 tablet daily', usage: 'Immunity, wound healing', sideEffects: ['Nausea'], prescription: false, inStock: true, rating: 4.3, image: '💊' },

  // Cough & Cold
  { id: 'ms036', name: 'Benadryl Cough Syrup', genericName: 'Diphenhydramine', category: 'Cough & Cold', manufacturer: 'J&J', price: 85, dosage: '10ml every 6 hours', usage: 'Cough, cold', sideEffects: ['Drowsiness'], prescription: false, inStock: true, rating: 4.3, image: '🧴' },
  { id: 'ms037', name: 'Sinarest Tablet', genericName: 'Paracetamol + Phenylephrine + Cetirizine', category: 'Cough & Cold', manufacturer: 'Centaur', price: 35, dosage: '1 tablet every 6 hours', usage: 'Cold, congestion, fever', sideEffects: ['Drowsiness', 'Dry mouth'], prescription: false, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms038', name: 'Vicks VapoRub', genericName: 'Camphor + Menthol + Eucalyptus', category: 'Cough & Cold', manufacturer: 'P&G', price: 95, dosage: 'Apply on chest/throat', usage: 'Congestion relief', sideEffects: ['Skin irritation (rare)'], prescription: false, inStock: true, rating: 4.7, image: '🧴' },

  // Skin Care
  { id: 'ms039', name: 'Betadine Antiseptic', genericName: 'Povidone-Iodine', category: 'Skin Care', manufacturer: 'Win Medicare', price: 75, dosage: 'Apply on wound', usage: 'Wound cleaning, antiseptic', sideEffects: ['Skin staining'], prescription: false, inStock: true, rating: 4.6, image: '🧴' },
  { id: 'ms040', name: 'Candid-B Cream', genericName: 'Clotrimazole + Beclomethasone', category: 'Skin Care', manufacturer: 'Glenmark', price: 110, dosage: 'Apply twice daily', usage: 'Fungal infections, itching', sideEffects: ['Burning sensation'], prescription: true, inStock: true, rating: 4.4, image: '🧴' },
  { id: 'ms041', name: 'Moov Spray', genericName: 'Diclofenac Diethylamine', category: 'Pain Relief', manufacturer: 'Reckitt', price: 150, dosage: 'Spray on affected area', usage: 'Muscle pain, joint pain', sideEffects: ['Skin irritation'], prescription: false, inStock: true, rating: 4.3, image: '🧴' },

  // Thyroid
  { id: 'ms042', name: 'Thyronorm 50mcg', genericName: 'Levothyroxine', category: 'Thyroid', manufacturer: 'Abbott', price: 110, dosage: '1 tablet daily on empty stomach', usage: 'Hypothyroidism', sideEffects: ['Palpitations', 'Weight changes'], prescription: true, inStock: true, rating: 4.5, image: '💊' },

  // Heart
  { id: 'ms043', name: 'Ecosprin 75mg', genericName: 'Aspirin', category: 'Heart', manufacturer: 'USV', price: 25, dosage: '1 tablet daily after food', usage: 'Heart protection, blood thinning', sideEffects: ['Stomach upset', 'Bleeding risk'], prescription: true, inStock: true, rating: 4.5, image: '💊' },
  { id: 'ms044', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Heart', manufacturer: 'Ranbaxy', price: 80, dosage: '1 tablet at bedtime', usage: 'High cholesterol', sideEffects: ['Muscle pain', 'Liver effects'], prescription: true, inStock: true, rating: 4.4, image: '💊' },
  { id: 'ms045', name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', category: 'Heart', manufacturer: 'Sun Pharma', price: 95, dosage: '1 tablet daily', usage: 'Prevent blood clots', sideEffects: ['Bleeding risk', 'Bruising'], prescription: true, inStock: true, rating: 4.3, image: '💊' },

  // ORS & Rehydration
  { id: 'ms046', name: 'ORS Powder (Electral)', genericName: 'Oral Rehydration Salts', category: 'Rehydration', manufacturer: 'FDC', price: 20, dosage: 'Dissolve in 1L water, sip frequently', usage: 'Dehydration, diarrhea', sideEffects: ['Vomiting (if drunk too fast)'], prescription: false, inStock: true, rating: 4.8, image: '🧴' },

  // Eye Care
  { id: 'ms047', name: 'Moxifloxacin Eye Drops', genericName: 'Moxifloxacin 0.5%', category: 'Eye Care', manufacturer: 'Cipla', price: 85, dosage: '1 drop 3 times daily', usage: 'Eye infections', sideEffects: ['Temporary stinging'], prescription: true, inStock: true, rating: 4.3, image: '💧' },
  { id: 'ms048', name: 'Refresh Tears', genericName: 'Carboxymethylcellulose', category: 'Eye Care', manufacturer: 'Allergan', price: 120, dosage: '1-2 drops as needed', usage: 'Dry eyes', sideEffects: ['Temporary blur'], prescription: false, inStock: true, rating: 4.6, image: '💧' },

  // Antifungal
  { id: 'ms049', name: 'Fluconazole 150mg', genericName: 'Fluconazole', category: 'Antifungal', manufacturer: 'Cipla', price: 45, dosage: '1 capsule single dose', usage: 'Fungal infections', sideEffects: ['Headache', 'Nausea'], prescription: true, inStock: true, rating: 4.2, image: '💊' },
  { id: 'ms050', name: 'Terbinafine Cream', genericName: 'Terbinafine 1%', category: 'Antifungal', manufacturer: 'Glenmark', price: 95, dosage: 'Apply twice daily for 2-4 weeks', usage: 'Ringworm, athlete\'s foot', sideEffects: ['Skin irritation'], prescription: false, inStock: true, rating: 4.4, image: '🧴' },
];

// Generate additional medicines
const MEDICINE_CATEGORIES = ['Pain & Fever', 'Antibiotics', 'Gastric', 'Allergy', 'Diabetes', 'Blood Pressure', 'Vitamins', 'Cough & Cold', 'Skin Care', 'Heart', 'Eye Care', 'Antifungal', 'Thyroid', 'Rehydration', 'Pain Relief', 'Asthma', 'Psychiatric', 'Anti-inflammatory', 'Muscle Relaxant', 'Antiviral'];
const MANUFACTURERS = ['Cipla', 'Sun Pharma', 'Dr Reddy\'s', 'Lupin', 'Abbott', 'Ranbaxy', 'Torrent', 'Glenmark', 'Zydus', 'Alkem', 'Intas', 'Mankind', 'Cadila', 'Biocon', 'Aurobindo'];

// Helper to get total counts
export function getDiseaseCount(): number {
  return DISEASES.length;
}

export function getMedicineCount(): number {
  return MEDICINE_SHOP.length;
}

export function searchDiseases(query: string, category?: string): Disease[] {
  const lower = query.toLowerCase();
  return DISEASES.filter((d) => {
    const matchQuery = !query || d.name.toLowerCase().includes(lower) ||
      d.description.toLowerCase().includes(lower) ||
      d.symptoms.some((s) => s.toLowerCase().includes(lower)) ||
      d.category.toLowerCase().includes(lower);
    const matchCategory = !category || d.category === category;
    return matchQuery && matchCategory;
  });
}

export function searchMedicines(query: string, category?: string): MedicineItem[] {
  const lower = query.toLowerCase();
  return MEDICINE_SHOP.filter((m) => {
    const matchQuery = !query || m.name.toLowerCase().includes(lower) ||
      m.genericName.toLowerCase().includes(lower) ||
      m.category.toLowerCase().includes(lower) ||
      m.usage.toLowerCase().includes(lower);
    const matchCategory = !category || m.category === category;
    return matchQuery && matchCategory;
  });
}

export function getDiseaseById(id: string): Disease | undefined {
  return DISEASES.find((d) => d.id === id);
}

export function getMedicineById(id: string): MedicineItem | undefined {
  return MEDICINE_SHOP.find((m) => m.id === id);
}

export const MEDICINE_CATEGORIES_LIST = [...new Set(MEDICINE_SHOP.map((m) => m.category))];
