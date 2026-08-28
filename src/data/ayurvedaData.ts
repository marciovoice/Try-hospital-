import { ChapterMarker, DoshaProfile, VideoSourceOption } from '../types';

export const CHAPTER_MARKERS: ChapterMarker[] = [
  {
    id: 'intro',
    startProgress: 0.0,
    endProgress: 0.22,
    sanskritTitle: 'चरक संहिता • सूत्रस्थान',
    title: 'The Eternal Codex of Life',
    tagline: 'Composed circa 300 BCE by Acharya Charaka',
    description: 'The foundational pillar of classical Ayurveda, unlocking the cosmic science of longevity, cellular equilibrium, and psychosomatic balance.',
    keyConcept: 'Ayu (Life) is the divine union of body, senses, mind, and soul.'
  },
  {
    id: 'unfolding',
    startProgress: 0.22,
    endProgress: 0.48,
    sanskritTitle: 'प्रकृति • पञ्चमहाभूत',
    title: 'The Great Elemental Architecture',
    tagline: 'Ether • Air • Fire • Water • Earth',
    description: 'As the sacred leather tome unlocks, the five cosmic elements (Panchamahabhuta) materialize into dynamic biological forces orchestrating every metabolic and neural impulse.',
    keyConcept: 'Whatever is in the macrocosm is present within the human microcosm.'
  },
  {
    id: 'tridosha',
    startProgress: 0.48,
    endProgress: 0.82,
    sanskritTitle: 'त्रिदोष • वात पित्त कफ',
    title: 'The Tri-Dosha Bio-Dynamic Nexus',
    tagline: 'Vata (Kinetic) • Pitta (Transformation) • Kapha (Structure)',
    description: 'Observing the intricate nexus of cellular metabolism: Agni (digestive fire) processes Ahara (nutrition) into Ojas (vital radiance) and Dhatus (tissues).',
    doshas: ['VATA', 'PITTA', 'KAPHA', 'AGNI', 'PRAKRITI', 'AHARA'],
    keyConcept: 'Health (Swastha) is established when doshas, agni, and tissues exist in balanced equilibrium.'
  },
  {
    id: 'rasayana',
    startProgress: 0.82,
    endProgress: 1.0,
    sanskritTitle: 'रसायन • दीर्घायुष्यम्',
    title: 'Rasayana & Cellular Rejuvenation',
    tagline: 'The Science of Vitality & Longevity',
    description: 'The ultimate synthesis of botanical therapeutics, circadian rhythmics (Dinacharya), and consciousness preservation for enduring lifespan.',
    keyConcept: 'Through Rasayana, one attains longevity, memory, radiant intellect, and freedom from disease.'
  }
];

export const PRESET_VIDEOS: VideoSourceOption[] = [
  {
    id: 'charaka',
    name: 'Charaka Samhita 3D Tome',
    description: 'Sacred Sanskrit treatise unfolding into 3D pages and holographic Tri-Dosha nexus.',
    url: '/charaka_samhita.mp4'
  }
];

export const DOSHA_PROFILES: DoshaProfile[] = [
  {
    id: 'vata',
    name: 'Vata Dosha',
    sanskritName: 'वात (Air & Ether)',
    elements: 'Vayu (Air) + Akasha (Ether)',
    attributes: ['Dry', 'Light', 'Cold', 'Rough', 'Subtle', 'Mobile'],
    seat: 'Colon, Pelvis, Bones, Skin, Ears',
    color: 'from-amber-500/20 to-indigo-500/20',
    accentHex: '#818cf8',
    summary: 'The principle of movement, kinetic impulse, neural communication, respiration, and cellular division.',
    balancedState: 'Creative, energetic, adaptable, lucid mind, enthusiastic, and swift comprehension.',
    imbalancedState: 'Anxiety, insomnia, dry skin, constipation, fatigue, joint cracking, and restless thoughts.',
    remedies: [
      'Warm cooked nourishing foods (ghee, sesame, stews)',
      'Grounding daily routines and regular sleep cycles',
      'Abhyanga (warm sesame oil self-massage)',
      'Herbs: Ashwagandha, Bala, Dashamula'
    ]
  },
  {
    id: 'pitta',
    name: 'Pitta Dosha',
    sanskritName: 'पित्त (Fire & Water)',
    elements: 'Tejas (Fire) + Jala (Water)',
    attributes: ['Hot', 'Sharp', 'Light', 'Oily', 'Liquid', 'Spreading'],
    seat: 'Stomach, Small Intestine, Liver, Blood, Eyes',
    color: 'from-amber-600/25 to-rose-600/25',
    accentHex: '#f59e0b',
    summary: 'The principle of transformation, enzymatic digestion, metabolism, body temperature, and intellect.',
    balancedState: 'Sharp intelligence, courageous leadership, strong digestion, warm complexion, and decisive clarity.',
    imbalancedState: 'Acid reflux, skin inflammations, irritability, anger, burning sensations, and perfectionist burnout.',
    remedies: [
      'Cooling, sweet, bitter, and astringent foods',
      'Moderate exercise in cool times of day (dawn/dusk)',
      'Sheetali pranayama (cooling breath)',
      'Herbs: Shatavari, Brahmi, Amalaki, Guduchi'
    ]
  },
  {
    id: 'kapha',
    name: 'Kapha Dosha',
    sanskritName: 'कफ (Earth & Water)',
    elements: 'Prithvi (Earth) + Jala (Water)',
    attributes: ['Heavy', 'Slow', 'Cold', 'Oily', 'Smooth', 'Dense', 'Stable'],
    seat: 'Chest, Throat, Head, Synovial joints, Stomach',
    color: 'from-emerald-600/20 to-amber-600/20',
    accentHex: '#34d399',
    summary: 'The principle of structure, cohesion, lubricity, immunity (Ojas), stability, and tissue building.',
    balancedState: 'Endurance, calmness, deep compassion, strong stamina, loyal heart, and radiant skin.',
    imbalancedState: 'Lethargy, excess weight, congestion, sluggish digestion, stubbornness, and mental fog.',
    remedies: [
      'Pungent, bitter, warm, light and spicy foods',
      'Vigorous cardiovascular movement and dynamic yoga',
      'Dry brushing (Garshana) and herbal steam baths',
      'Herbs: Trikatu, Guggulu, Tulsi, Punarnava'
    ]
  }
];

export const ASHTANGA_BRANCHES = [
  {
    sanskrit: 'कायचिकित्सा (Kāyacikitsā)',
    name: 'Internal Medicine & Therapeutics',
    description: 'Systemic disorders originating from digestive fire (Agni) imbalances affecting tissues and circulation.'
  },
  {
    sanskrit: 'शल्यतन्त्र (Śalyatantra)',
    name: 'Surgery & Anatomy (Sushruta tradition)',
    description: 'Techniques of extraction, incision, suturing, and management of traumatic tissue disruption.'
  },
  {
    sanskrit: 'शालाक्यतन्त्र (Śālākyatantra)',
    name: 'ENT & Ophthalmology',
    description: 'Diseases of organs located above the clavicle (eyes, ears, nose, throat, and cranial structures).'
  },
  {
    sanskrit: 'कौमारभृत्य (Kaumārabhṛtya)',
    name: 'Pediatrics & Obstetrics',
    description: 'Maternal wellness, neonatal care, embryology, and childhood constitutional development.'
  },
  {
    sanskrit: 'अगदतन्त्र (Agadatantra)',
    name: 'Toxicology & Purification',
    description: 'Neutralization of biotic poisons, environmental toxins (Ama), and therapeutic detoxification.'
  },
  {
    sanskrit: 'रसायनतन्त्र (Rasāyanatantra)',
    name: 'Geriatrics & Rejuvenation',
    description: 'Longevity science, cellular regeneration, intellect preservation, and immune enhancement.'
  },
  {
    sanskrit: 'वाजीकरण (Vājīkaraṇa)',
    name: 'Reproductive Vitality & Genetics',
    description: 'Optimum gamete vitality, reproductive endocrinology, and psychosexual equilibrium.'
  },
  {
    sanskrit: 'भूतविद्या (Bhūtavidyā)',
    name: 'Psychiatry & Mind Sciences',
    description: 'Psychological harmony (Sattva, Rajas, Tamas) and psychosomatic disease resolution.'
  }
];

export const PRAKRITI_QUESTIONS = [
  {
    id: 1,
    question: 'How would you describe your natural body frame and bone structure?',
    options: [
      { text: 'Slender, narrow hips/shoulders, prominent joints, hard to gain weight', dosha: 'vata' },
      { text: 'Medium athletic build, good muscle tone, balanced proportions', dosha: 'pitta' },
      { text: 'Solid, broad shoulders/frame, heavy bones, gains weight easily', dosha: 'kapha' }
    ]
  },
  {
    id: 2,
    question: 'What is your typical digestion and appetite pattern?',
    options: [
      { text: 'Variable / irregular — sometimes starving, sometimes skip meals easily; prone to gas/bloating', dosha: 'vata' },
      { text: 'Strong and intense — get irritable ("hangry") if meals are delayed; fast digestion', dosha: 'pitta' },
      { text: 'Slow, steady, and moderate — can skip meals without distress; prone to heaviness after eating', dosha: 'kapha' }
    ]
  },
  {
    id: 3,
    question: 'How is your response to weather and environmental temperature?',
    options: [
      { text: 'Dislike cold, wind, and dry weather; love warmth, sun, and cozy blankets', dosha: 'vata' },
      { text: 'Dislike heat and direct sun; prefer cooler breezes and air conditioning', dosha: 'pitta' },
      { text: 'Dislike damp, chilly, overcast weather; comfortable in most temperatures', dosha: 'kapha' }
    ]
  },
  {
    id: 4,
    question: 'How does your mind process new information and respond to stress?',
    options: [
      { text: 'Learns quickly and forgets quickly; stress triggers worry, anxiety, and overthinking', dosha: 'vata' },
      { text: 'Sharp, organized, analytical; stress triggers impatience, frustration, or critical drive', dosha: 'pitta' },
      { text: 'Takes time to learn but retains forever; calm and steady under stress, occasionally resistant to change', dosha: 'kapha' }
    ]
  },
  {
    id: 5,
    question: 'What characterizes your natural sleep rhythm?',
    options: [
      { text: 'Light, interrupted, vivid dreams; wake up frequently or rise very early', dosha: 'vata' },
      { text: 'Moderate, sound 6–8 hours; occasionally wake up feeling warm', dosha: 'pitta' },
      { text: 'Deep, heavy, continuous 8+ hours; slow to awaken in the morning', dosha: 'kapha' }
    ]
  }
];

export const HERBAL_FORMULATIONS = [
  {
    name: 'Chyawanprash Awaleha',
    sanskrit: 'च्यवनप्राश अवलेह',
    category: 'Supreme Rasayana',
    keyIngredients: 'Amalaki (Indian Gooseberry), Ashwagandha, Pippali, Sesame Oil, Ghee, Raw Honey',
    benefits: 'Boosts Ojas (immunity), strengthens respiratory vitality, enhances cellular longevity and stamina.'
  },
  {
    name: 'Triphala Churna',
    sanskrit: 'त्रिफला चूर्ण',
    category: 'Metabolic & Digestive Harmonizer',
    keyIngredients: 'Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellirica), Amalaki (Emblica officinalis)',
    benefits: 'Gently cleanses the gastrointestinal tract, supports microbial balance, and nourishes vision.'
  },
  {
    name: 'Brahmi Ghrita',
    sanskrit: 'ब्राह्मी घृत',
    category: 'Medhya Rasayana (Cognitive Tonic)',
    keyIngredients: 'Bacopa monnieri, Shankhpushpi, Vacha, Medicated Cow Ghee',
    benefits: 'Crosses blood-brain barrier to nourish neural synapses, calm Vata/Pitta in the mind, and boost memory.'
  },
  {
    name: 'Ashwagandha Rasayana',
    sanskrit: 'अश्वगन्धा रसायन',
    category: 'Balya & Adaptogenic Shield',
    keyIngredients: 'Withania somnifera, Cardamom, Milk decoction, Raw sugar',
    benefits: 'Regulates hypothalamic-pituitary-adrenal axis, reduces cortisol, and builds neuromuscular strength.'
  }
];
