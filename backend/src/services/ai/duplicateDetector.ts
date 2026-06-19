import { logger } from '../../utils/logger';

interface DuplicateResult {
  isDuplicate: boolean;
  similarComplaints: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
  confidence: number;
}

/**
 * Simple cosine similarity using word frequency vectors
 */
function cosineSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Build frequency maps
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();
  const allWords = new Set<string>();

  for (const w of words1) {
    freq1.set(w, (freq1.get(w) || 0) + 1);
    allWords.add(w);
  }
  for (const w of words2) {
    freq2.set(w, (freq2.get(w) || 0) + 1);
    allWords.add(w);
  }

  // Calculate cosine similarity
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const word of allWords) {
    const v1 = freq1.get(word) || 0;
    const v2 = freq2.get(word) || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Check for duplicate complaints using text similarity
 */
export async function detectDuplicates(
  newComplaint: { title: string; description: string; category: string; latitude?: number; longitude?: number },
  existingComplaints: Array<{ id: string; title: string; description: string; category: string; latitude?: number; longitude?: number }>
): Promise<DuplicateResult> {
  const newText = `${newComplaint.title} ${newComplaint.description}`;
  const similarComplaints: Array<{ id: string; title: string; similarity: number }> = [];

  for (const existing of existingComplaints) {
    // Category must match for duplicate consideration
    if (existing.category !== newComplaint.category) continue;

    const existingText = `${existing.title} ${existing.description}`;
    let similarity = cosineSimilarity(newText, existingText);

    // Boost similarity if location is close
    if (newComplaint.latitude && newComplaint.longitude && existing.latitude && existing.longitude) {
      const distance = getDistanceKm(
        newComplaint.latitude, newComplaint.longitude,
        existing.latitude, existing.longitude
      );
      if (distance < 0.5) { // Within 500 meters
        similarity = Math.min(1, similarity + 0.15);
      }
    }

    if (similarity > 0.4) {
      similarComplaints.push({
        id: existing.id,
        title: existing.title,
        similarity: Math.round(similarity * 100) / 100,
      });
    }
  }

  // Sort by similarity descending
  similarComplaints.sort((a, b) => b.similarity - a.similarity);

  const isDuplicate = similarComplaints.length > 0 && similarComplaints[0].similarity > 0.7;

  logger.info(`Duplicate check: ${isDuplicate ? 'DUPLICATE FOUND' : 'No duplicates'} (${similarComplaints.length} similar)`);

  return {
    isDuplicate,
    similarComplaints: similarComplaints.slice(0, 5),
    confidence: similarComplaints.length > 0 ? similarComplaints[0].similarity : 0,
  };
}

/**
 * Haversine formula to calculate distance between two GPS coordinates
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
