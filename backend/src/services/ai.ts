import { OpenAI } from 'openai';
import { StructuredPreferences, MatchExplanation } from '@soulmate/shared/src/types';

// Fallback arrays for realistic mock data when OpenAI key is missing
const VALUE_OPTIONS = ['Family values', 'Career orientation', 'Spiritual growth', 'Financial stability', 'Adventure/Travel', 'Traditional mindset', 'Modern worldview', 'Mutual respect'];
const LIFESTYLE_OPTIONS = ['Vegetarian', 'Non-vegetarian', 'Teetotaler', 'Occasional drinker', 'Fitness enthusiast', 'Night owl', 'Early riser', 'Pet lover'];
const EDUCATION_OPTIONS = ['Bachelors Degree', 'Masters Degree', 'PhD', 'Doctorate', 'Engineering', 'Medical', 'MBA', 'High School'];
const CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key') {
    return null;
  }
  return new OpenAI({ apiKey });
};

/**
 * AI service to extract structured preferences from a conversation transcript
 */
export const extractPreferences = async (transcript: string): Promise<StructuredPreferences> => {
  const openai = getOpenAIClient();

  if (!openai) {
    console.log('OpenAI Key missing, returning mock preferences based on transcript');
    // Generates a mock result based on keywords in transcript
    const values: string[] = [];
    const lifestyle: string[] = [];
    
    if (transcript.toLowerCase().includes('family')) values.push('Family values');
    if (transcript.toLowerCase().includes('career') || transcript.toLowerCase().includes('job')) values.push('Career orientation');
    if (transcript.toLowerCase().includes('spiritual') || transcript.toLowerCase().includes('god')) values.push('Spiritual growth');
    if (transcript.toLowerCase().includes('travel') || transcript.toLowerCase().includes('explore')) values.push('Adventure/Travel');
    
    if (transcript.toLowerCase().includes('veg')) lifestyle.push('Vegetarian');
    if (transcript.toLowerCase().includes('drink') || transcript.toLowerCase().includes('alcohol')) lifestyle.push('Teetotaler');
    if (transcript.toLowerCase().includes('fit') || transcript.toLowerCase().includes('gym')) lifestyle.push('Fitness enthusiast');

    // Default fallbacks if none matched
    if (values.length === 0) values.push('Family values', 'Mutual respect');
    if (lifestyle.length === 0) lifestyle.push('Teetotaler', 'Early riser');

    return {
      ageMin: transcript.match(/(\d+)\s*to/)?.[1] ? parseInt(transcript.match(/(\d+)\s*to/)?.[1] || '22') : 22,
      ageMax: transcript.match(/to\s*(\d+)/)?.[1] ? parseInt(transcript.match(/to\s*(\d+)/)?.[1] || '30') : 30,
      values,
      lifestyle,
      locationPrefs: ['Mumbai', 'Pune', 'Maharashtra'],
      education: ['Bachelors Degree', 'Masters Degree']
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI Relationship Onboarding Specialist. Analyze the user preferences conversation transcript and output structured preferences in JSON format.
          Ensure you output only JSON matching this schema:
          {
            "ageMin": number,
            "ageMax": number,
            "values": string[],
            "lifestyle": string[],
            "locationPrefs": string[],
            "education": string[]
          }
          Ensure fields are populated based on user's direct responses or logical inferences.`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      ageMin: result.ageMin || 22,
      ageMax: result.ageMax || 35,
      values: result.values || ['Family values'],
      lifestyle: result.lifestyle || ['Teetotaler'],
      locationPrefs: result.locationPrefs || [],
      education: result.education || []
    };
  } catch (error) {
    console.error('Error in extractPreferences AI service:', error);
    throw error;
  }
};

/**
 * AI service to generate a detailed compatibility score and plain-language explanation ("Why")
 */
export const generateMatchExplanation = async (
  profileA: any,
  profileB: any
): Promise<{ compatibilityScore: number; aiExplanation: MatchExplanation }> => {
  const openai = getOpenAIClient();

  if (!openai) {
    // Generate intelligent mock explanation comparing profiles
    const ageDiff = Math.abs(
      new Date(profileA.dateOfBirth).getFullYear() - new Date(profileB.dateOfBirth).getFullYear()
    );
    
    // Compare matching cities or overlapping values/lifestyle
    const sameCity = profileA.location.city.toLowerCase() === profileB.location.city.toLowerCase();
    const commonInterests = ['family values', 'respect', 'trekking', 'cinema', 'home cooking'];
    
    const greenFlags = [
      `Both value ${profileA.gender === 'male' ? 'traditional family support' : 'long-term stability'}.`,
      sameCity ? `Both reside in ${profileA.location.city}, reducing geological friction.` : `Both willing to relocate across India.`,
      `Similar alignment in career goals and lifestyle choices.`
    ];

    const redFlags = ageDiff > 5 
      ? ['Age gap of over 5 years might lead to differing life stages and timelines.']
      : ['Slightly different views on spending vs saving habits.'];

    const sharedInterests = ['Travel', 'Family Gatherings', 'Movies', 'Indian Cuisine'];

    // Compatibility math
    let score = 85;
    if (sameCity) score += 5;
    if (ageDiff <= 3) score += 5;
    if (ageDiff > 7) score -= 10;

    const reasoning = `You both score ${score}% because you share critical core values around family support and career development. ${profileA.location.city === profileB.location.city ? `Living in the same city (${profileA.location.city}) makes meeting in person smooth.` : `Though you reside in different cities (${profileA.location.city} vs ${profileB.location.city}), you share location preferences in your search profiles.`} Additionally, your lifestyle choices (like views on vegetarianism and social outings) align strongly, creating a solid base for matrimonial discussions.`;

    return {
      compatibilityScore: Math.min(score, 98),
      aiExplanation: {
        reasoning,
        greenFlags,
        redFlags,
        sharedInterests
      }
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Relationship Counselor and Matchmaker. Compare the two profiles (Profile A and Profile B) and output a compatibility analysis in JSON format.
          Ensure you output only JSON matching this schema:
          {
            "compatibilityScore": number (0-100),
            "reasoning": string (a warm, explainable explanation paragraph explaining exactly WHY they match, formatted for an Indian matrimonial user),
            "greenFlags": string[] (3 reasons they align well),
            "redFlags": string[] (1-2 points of potential friction or difference),
            "sharedInterests": string[]
          }`
        },
        {
          role: 'user',
          content: `Profile A: ${JSON.stringify(profileA)}\n\nProfile B: ${JSON.stringify(profileB)}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      compatibilityScore: result.compatibilityScore || 80,
      aiExplanation: {
        reasoning: result.reasoning || 'You share similar values.',
        greenFlags: result.greenFlags || [],
        redFlags: result.redFlags || [],
        sharedInterests: result.sharedInterests || []
      }
    };
  } catch (error) {
    console.error('Error in generateMatchExplanation AI service:', error);
    throw error;
  }
};
