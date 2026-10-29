/**
 * Local Rule-Based Extractor for Vaani
 * Provides independent, client-side, and server-side pattern recognition
 * for natural English, Hindi, and Assamese spoken transcripts without requiring external AI APIs.
 */

export interface ExtractorFieldSchema {
  id: string;
  label?: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export interface HeuristicExtractionResult {
  extracted: Record<string, any>;
  uncertain_fields: string[];
  missing_fields: string[];
  summary: string;
}

/**
 * Normalizes title case for English names (e.g. "rahul sharma" -> "Rahul Sharma")
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts Eastern Indic (Assamese/Bengali) and Devanagari digits to standard Arabic digits.
 */
export function normalizeIndicDigits(text: string): string {
  return text
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

/**
 * Extracts structured form fields from natural spoken sentences.
 */
export function heuristicExtract(
  transcript: string,
  fields: ExtractorFieldSchema[] = [],
  _languageHint?: string
): HeuristicExtractionResult {
  const extracted: Record<string, any> = {};
  const uncertain_fields: string[] = [];

  if (!transcript || !transcript.trim()) {
    const missing_fields = fields.filter((f) => f.required).map((f) => f.id);
    return {
      extracted: {},
      uncertain_fields: [],
      missing_fields,
      summary: 'Transcript is empty.',
    };
  }

  // 0. Pre-normalize digits and whitespace
  const rawText = transcript.trim();
  const text = normalizeIndicDigits(rawText);

  // 1. Phone extraction
  // Matches 10 digits starting with 6, 7, 8, 9 with optional spaces, hyphens, or prefixes (+91, 91, 0)
  const phoneContextRegex =
    /(?:phone(?:\s+number)?|mobile(?:\s+number)?|contact(?:\s+number)?|call(?:\s+me)?(?:\s+at)?|फोन|मोबाइल|नंबर|নম্বৰ|ফোন)\s*[:=]?\s*(?:\+?91[\s-]?)?([6-9](?:[\s-]?\d){9})/i;
  const standalonePhoneRegex = /(?:\+?91[\s-]?)?([6-9](?:[\s-]?\d){9})/;

  const phoneMatch = text.match(phoneContextRegex) || text.match(standalonePhoneRegex);
  if (phoneMatch) {
    const rawDigits = phoneMatch[1].replace(/\D/g, '');
    if (rawDigits.length === 10) {
      extracted.phone = rawDigits;
    }
  }

  // 2. Email extraction
  // Standard email pattern
  const standardEmailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (standardEmailMatch) {
    extracted.email = standardEmailMatch[0].toLowerCase();
  } else {
    // Spoken speech email patterns like "rahul dot sharma at gmail dot com" or "rahul at example dot com"
    const spokenEmailMatch = text.match(
      /\b([a-zA-Z0-9_%+-]+(?:\s+(?:dot|\.)\s+[a-zA-Z0-9_%+-]+)*)\s+(?:at(?:\s+the\s+rate)?|@)\s+([a-zA-Z0-9.-]+)\s*(?:dot|\.)\s*([a-zA-Z]{2,})\b/i
    );
    if (spokenEmailMatch) {
      const userPart = spokenEmailMatch[1].replace(/\s+(?:dot|\.)\s+/gi, '.').replace(/\s+/g, '');
      const domainPart = spokenEmailMatch[2].replace(/\s+/g, '');
      const tldPart = spokenEmailMatch[3].replace(/\s+/g, '');
      extracted.email = `${userPart}@${domainPart}.${tldPart}`.toLowerCase();
    }
  }

  // 3. Age extraction
  // Matches natural English ("24 years old", "age 24", "i am 24 years old"),
  // Hindi ("मेरी उम्र 24 साल है", "उम्र 24"), and Assamese ("মোৰ বয়স ২৪ বছৰ")
  const ageWithUnitRegex =
    /(\d{1,3})\s*(?:years?(?:\s*old)?|yrs?|साल|वर्ष|বছৰ|বছর)\b/i;
  const ageWithContextRegex =
    /(?:(?:my\s+)?age(?:\s+is)?\s+|aged\s+|उम्र(?:\s+है)?\s*|বয়স(?:\s+হয়)?\s*|বয়স(?:\s+হয়)?\s*)(\d{1,3})\b/i;
  const iAmAgeRegex =
    /\bi\s+am\s+(\d{1,3})\b(?!\s*(?:st|nd|rd|th|am|pm|[a-zA-Z]{3,}))/i;

  const ageMatch =
    text.match(ageWithUnitRegex) ||
    text.match(ageWithContextRegex) ||
    text.match(iAmAgeRegex);

  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 10 && ageNum <= 120) {
      extracted.age = ageNum;
    }
  }

  // 4. Name extraction
  // English: "i am rahul sharma", "my name is rahul sharma", "this is rahul sharma"
  // Followed by natural conversational continuation delimiters ("i am", "and", "live", "phone", etc.)
  const englishNameRegex =
    /(?:my\s+name\s+is|i\s+am|this\s+is|myself|name\s+is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){1,3})(?=(?:\s+(?:i\s+am|and\s+i|and\s+live|and\s+living|and|i|my|from|live|living|age|phone|mobile|email|contact)\b|[.,;!?]|$))/i;

  // Single word name fallback if multi-word didn't match
  const englishSingleNameRegex =
    /(?:my\s+name\s+is|this\s+is|name\s+is)\s+([a-zA-Z]{3,})(?=(?:\s+(?:and|i|my|from|live|living|age|phone|mobile|email)\b|[.,;!?]|$))/i;

  // Hindi: "मेरा नाम राहुल शर्मा है", "मैं राहुल शर्मा हूँ"
  const hindiNameMatch =
    text.match(/मेरा\s+नाम\s+([\u0900-\u097Fa-zA-Z\s]+?)(?:\s+है|\s+हूँ|[।.]|\s+(?:मेरी|मेरा|उम्र|फोन|मोबाइल|रहता|रहती)|$)/) ||
    text.match(/मैं\s+([\u0900-\u097Fa-zA-Z\s]+?)(?:\s+हूँ|\s+है|[।.]|\s+(?:मेरी|मेरा|उम्र|फोन|मोबाइल|रहता|रहती)|$)/);

  // Assamese: "মোৰ নাম ৰাহুল শৰ্মা", "মই ৰাহুল শৰ্মা"
  const assameseNameMatch =
    text.match(/মোৰ\s+নাম\s+([\u0980-\u09FFa-zA-Z\s]+?)(?:\s+হয়|\s+হয়|[।.]|\s+(?:মোৰ|মই|বয়স|বয়স|ফোন|ম’বাইল|থাকোঁ)|$)/) ||
    text.match(/মই\s+([\u0980-\u09FFa-zA-Z\s]+?)(?:\s+হয়|\s+হয়|[।.]|\s+(?:মোৰ|মই|বয়স|বয়স|ফোন|ম’বাইল|থাকোঁ)|$)/);
  const englishNameMatch = text.match(englishNameRegex) || text.match(englishSingleNameRegex);

  if (hindiNameMatch && hindiNameMatch[1].trim()) {
    extracted.full_name = hindiNameMatch[1].trim();
  } else if (assameseNameMatch && assameseNameMatch[1].trim()) {
    extracted.full_name = assameseNameMatch[1].trim();
  } else if (englishNameMatch && englishNameMatch[1].trim()) {
    const rawName = englishNameMatch[1].trim();
    // Filter out common false-positive words if accidentally captured
    if (!/^(a|an|the|indian|citizen|user|applicant)$/i.test(rawName)) {
      extracted.full_name = toTitleCase(rawName);
    }
  }

  // 5. City and State Detection
  // Comprehensive list of Assam cities, Northeastern cities, and major Indian metros
  const cityStateMap: Record<string, { city: string; state: string; aliases: string[] }> = {
    guwahati: {
      city: 'Guwahati',
      state: 'Assam',
      aliases: ['guwahati', 'गुवाहाटी', 'গুৱাহাটী', 'gauhati'],
    },
    dibrugarh: {
      city: 'Dibrugarh',
      state: 'Assam',
      aliases: ['dibrugarh', 'डिब्रूगढ़', 'ডিব্ৰুগড়'],
    },
    jorhat: {
      city: 'Jorhat',
      state: 'Assam',
      aliases: ['jorhat', 'जोरहाट', 'যোৰহাট'],
    },
    silchar: {
      city: 'Silchar',
      state: 'Assam',
      aliases: ['silchar', 'सिल्चर', 'শিলচৰ'],
    },
    nagaon: {
      city: 'Nagaon',
      state: 'Assam',
      aliases: ['nagaon', 'नगांव', 'নগাঁও'],
    },
    tezpur: {
      city: 'Tezpur',
      state: 'Assam',
      aliases: ['tezpur', 'तेजपुर', 'তেজপুৰ'],
    },
    tinsukia: {
      city: 'Tinsukia',
      state: 'Assam',
      aliases: ['tinsukia', 'तिनसुकिया', 'তিনিচুকীয়া'],
    },
    bongaigaon: {
      city: 'Bongaigaon',
      state: 'Assam',
      aliases: ['bongaigaon', 'बोंगाईगांव', 'বঙাইগাঁও'],
    },
    barpeta: {
      city: 'Barpeta',
      state: 'Assam',
      aliases: ['barpeta', 'बरपेटा', 'বৰপেটা'],
    },
    sivasagar: {
      city: 'Sivasagar',
      state: 'Assam',
      aliases: ['sivasagar', 'शिवसागर', 'শিৱসাগৰ'],
    },
    dhubri: {
      city: 'Dhubri',
      state: 'Assam',
      aliases: ['dhubri', 'धुबरी', 'ধুবুৰী'],
    },
    karimganj: {
      city: 'Karimganj',
      state: 'Assam',
      aliases: ['karimganj', 'करीमगंज', 'কৰিমগঞ্জ'],
    },
    golaghat: {
      city: 'Golaghat',
      state: 'Assam',
      aliases: ['golaghat', 'गोलाघाट', 'গোলাঘাট'],
    },
    shillong: {
      city: 'Shillong',
      state: 'Meghalaya',
      aliases: ['shillong', 'शिलांग', 'শ্বিলং'],
    },
    itanagar: {
      city: 'Itanagar',
      state: 'Arunachal Pradesh',
      aliases: ['itanagar', 'ईटानगर'],
    },
    delhi: {
      city: 'Delhi',
      state: 'Delhi',
      aliases: ['delhi', 'new delhi', 'दिल्ली', 'नई दिल्ली'],
    },
    mumbai: {
      city: 'Mumbai',
      state: 'Maharashtra',
      aliases: ['mumbai', 'बॉम्बे', 'मुंबई'],
    },
    kolkata: {
      city: 'Kolkata',
      state: 'West Bengal',
      aliases: ['kolkata', 'कलकत्ता', 'कोलकाता', 'কলকাতা'],
    },
    bangalore: {
      city: 'Bangalore',
      state: 'Karnataka',
      aliases: ['bangalore', 'bengaluru', 'बैंगलोर'],
    },
    chennai: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      aliases: ['chennai', 'मद्रास', 'चेन्नई'],
    },
  };

  const lowerText = text.toLowerCase();

  for (const info of Object.values(cityStateMap)) {
    const hasCity = info.aliases.some((alias) => lowerText.includes(alias.toLowerCase()));
    if (hasCity) {
      extracted.city = info.city;
      if (!extracted.state) {
        extracted.state = info.state;
      }
      break;
    }
  }

  // Check for explicit State mentions
  const stateAliases: Record<string, string[]> = {
    Assam: ['assam', 'असम', 'অসম'],
    Delhi: ['delhi', 'दिल्ली'],
    Maharashtra: ['maharashtra', 'महाराष्ट्र'],
    'West Bengal': ['west bengal', 'पश्चिम बंगाल', 'পশ্চিমবংগ'],
    Meghalaya: ['meghalaya', 'मेघालय'],
    'Arunachal Pradesh': ['arunachal', 'अरुणाचल'],
    Tripura: ['tripura', 'त्रिपुरा'],
    Nagaland: ['nagaland', 'नागालैंड'],
    Manipur: ['manipur', 'मणिपुर'],
    Mizoram: ['mizoram', 'मिजोरम'],
  };

  for (const [stName, aliases] of Object.entries(stateAliases)) {
    if (aliases.some((al) => lowerText.includes(al))) {
      extracted.state = stName;
      break;
    }
  }

  // 6. Address snippet extraction
  // Matches street name, house number, road, nagar, or ward
  const addressMatch = text.match(
    /(?:at\s+|address(?:\s+is)?\s+|रहता हूँ,?\s*|থাকোঁ,?\s*)([\w\d\s,#/-]+(?:Road|Nagar|Ward|Street|House|Lane|Colony|Enclave|मकान|नगर|ৰোড|নগৰ|ৱাৰ্ড)[\w\d\s,#/-]*)/i
  );
  if (addressMatch) {
    extracted.address = addressMatch[1].trim();
  }

  // 7. Preferred Language Detection
  if (lowerText.includes('hindi') || text.includes('हिन्दी')) {
    extracted.preferred_language = 'Hindi';
  } else if (lowerText.includes('assamese') || text.includes('অসমীয়া') || text.includes('অসমীয়া')) {
    extracted.preferred_language = 'Assamese';
  } else if (lowerText.includes('english') || text.includes('अंग्रेजी')) {
    extracted.preferred_language = 'English';
  } else {
    // Detect script of the spoken transcript
    extracted.preferred_language = /[\u0980-\u09FF]/.test(text)
      ? 'Assamese'
      : /[\u0904-\u0939\u0950-\u0963\u0970-\u097F]/.test(text)
      ? 'Hindi'
      : 'English';
  }

  // Ensure we do not produce false positive extractions when no substantive identity or location details exist
  const substantiveFields = ['full_name', 'age', 'phone', 'email', 'city', 'state', 'address'];
  const hasSubstantiveData = substantiveFields.some(
    (k) => extracted[k] !== undefined && extracted[k] !== null && String(extracted[k]).trim() !== ''
  );
  if (!hasSubstantiveData) {
    delete extracted.preferred_language;
  }

  // 8. Missing required fields calculation
  const missing_fields = fields
    .filter(
      (f) =>
        f.required &&
        (extracted[f.id] === undefined ||
          extracted[f.id] === null ||
          extracted[f.id] === '')
    )
    .map((f) => f.id);

  const count = Object.keys(extracted).length;

  return {
    extracted,
    uncertain_fields,
    missing_fields,
    summary:
      count > 0
        ? `Extracted ${count} field(s) from speech transcript using local pattern extractor.`
        : 'Could not extract recognized form fields from transcript.',
  };
}
