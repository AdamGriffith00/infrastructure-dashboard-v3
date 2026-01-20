/**
 * Bid Intelligence Utility
 * Provides scoring, recommendations, and competitive analysis for opportunities
 */

// Gleeds' core strengths and capabilities (configurable)
const COMPANY_PROFILE = {
  name: 'Gleeds',
  strongSectors: ['rail', 'aviation', 'highways', 'utilities'],
  strongRegions: ['london', 'north-west', 'midlands', 'scotland'],
  sweetSpotValue: { min: 5000000, max: 500000000 }, // £5M - £500M
  expertise: {
    'rail': { level: 'expert', winRate: 0.35 },
    'aviation': { level: 'expert', winRate: 0.30 },
    'highways': { level: 'strong', winRate: 0.28 },
    'utilities': { level: 'strong', winRate: 0.25 },
    'maritime': { level: 'moderate', winRate: 0.20 }
  },
  services: ['cost-management', 'project-management', 'programme-management', 'advisory']
};

// Known competitors by sector
const COMPETITORS = {
  'rail': [
    { name: 'Turner & Townsend', strength: 'strong', focus: ['cost', 'pm'] },
    { name: 'Mace', strength: 'strong', focus: ['delivery', 'pm'] },
    { name: 'Arcadis', strength: 'strong', focus: ['advisory', 'cost'] },
    { name: 'AECOM', strength: 'moderate', focus: ['design', 'pm'] },
    { name: 'Faithful+Gould', strength: 'moderate', focus: ['cost'] }
  ],
  'aviation': [
    { name: 'Turner & Townsend', strength: 'strong', focus: ['cost', 'pm'] },
    { name: 'Mace', strength: 'strong', focus: ['delivery'] },
    { name: 'Arcadis', strength: 'moderate', focus: ['advisory'] },
    { name: 'Arup', strength: 'moderate', focus: ['design', 'advisory'] }
  ],
  'highways': [
    { name: 'Turner & Townsend', strength: 'strong', focus: ['cost', 'pm'] },
    { name: 'AECOM', strength: 'strong', focus: ['design', 'pm'] },
    { name: 'Jacobs', strength: 'strong', focus: ['design', 'delivery'] },
    { name: 'WSP', strength: 'moderate', focus: ['design'] },
    { name: 'Atkins', strength: 'moderate', focus: ['design', 'pm'] }
  ],
  'utilities': [
    { name: 'Mott MacDonald', strength: 'strong', focus: ['design', 'pm'] },
    { name: 'Jacobs', strength: 'strong', focus: ['design'] },
    { name: 'Arcadis', strength: 'moderate', focus: ['advisory', 'cost'] },
    { name: 'Stantec', strength: 'moderate', focus: ['design'] }
  ],
  'maritime': [
    { name: 'Royal HaskoningDHV', strength: 'strong', focus: ['design'] },
    { name: 'Arup', strength: 'moderate', focus: ['design', 'advisory'] },
    { name: 'Mott MacDonald', strength: 'moderate', focus: ['design', 'pm'] }
  ]
};

// Scoring weights
const WEIGHTS = {
  sectorFit: 0.25,
  regionFit: 0.15,
  valueFit: 0.20,
  competitionLevel: 0.15,
  clientRelationship: 0.15,
  timing: 0.10
};

/**
 * Calculate bid intelligence score for an opportunity
 * @param {Object} opportunity - The opportunity to score
 * @param {Object} context - Additional context (existing clients, etc.)
 * @returns {Object} Score breakdown and recommendations
 */
export function calculateBidScore(opportunity, context = {}) {
  const scores = {
    sectorFit: scoreSectorFit(opportunity.sector),
    regionFit: scoreRegionFit(opportunity.region),
    valueFit: scoreValueFit(opportunity.value),
    competitionLevel: scoreCompetitionLevel(opportunity.sector, opportunity.value),
    clientRelationship: scoreClientRelationship(opportunity.client, context.existingClients || []),
    timing: scoreTiming(opportunity.bidDeadline, opportunity.contractStart)
  };

  // Calculate weighted total
  const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + (value * WEIGHTS[key]);
  }, 0);

  // Generate recommendation
  const recommendation = generateRecommendation(totalScore, scores, opportunity);

  return {
    totalScore: Math.round(totalScore),
    scores,
    recommendation,
    winProbability: estimateWinProbability(totalScore, opportunity.sector),
    competitorAnalysis: getCompetitorAnalysis(opportunity.sector),
    strategicInsights: generateStrategicInsights(scores, opportunity)
  };
}

/**
 * Score sector fit (0-100)
 */
function scoreSectorFit(sector) {
  const expertise = COMPANY_PROFILE.expertise[sector];
  if (!expertise) return 40; // Unknown sector

  switch (expertise.level) {
    case 'expert': return 95;
    case 'strong': return 80;
    case 'moderate': return 60;
    default: return 40;
  }
}

/**
 * Score regional fit (0-100)
 */
function scoreRegionFit(region) {
  if (!region) return 50;
  const normalized = region.toLowerCase().replace(/\s+/g, '-');
  return COMPANY_PROFILE.strongRegions.includes(normalized) ? 90 : 60;
}

/**
 * Score value fit (0-100) - higher for sweet spot values
 */
function scoreValueFit(value) {
  if (!value) return 50;

  const { min, max } = COMPANY_PROFILE.sweetSpotValue;

  // Perfect sweet spot
  if (value >= min && value <= max) return 95;

  // Slightly outside sweet spot
  if (value >= min * 0.5 && value <= max * 2) return 75;

  // Small projects (still viable)
  if (value < min * 0.5 && value > 1000000) return 55;

  // Very large (more risk/competition)
  if (value > max * 2) return 45;

  // Very small
  return 35;
}

/**
 * Score competition level (0-100, higher = less competition)
 */
function scoreCompetitionLevel(sector, value) {
  const competitors = COMPETITORS[sector] || [];
  const strongCompetitors = competitors.filter(c => c.strength === 'strong').length;

  // High-value projects attract more competition
  const valueMultiplier = value > 100000000 ? 0.8 : value > 50000000 ? 0.9 : 1;

  let baseScore;
  if (strongCompetitors >= 3) baseScore = 50;
  else if (strongCompetitors >= 2) baseScore = 65;
  else if (strongCompetitors >= 1) baseScore = 75;
  else baseScore = 90;

  return Math.round(baseScore * valueMultiplier);
}

/**
 * Score client relationship (0-100)
 */
function scoreClientRelationship(client, existingClients) {
  if (!client) return 50;

  // Check if we have existing relationship
  const isExisting = existingClients.some(c =>
    c.toLowerCase().includes(client.toLowerCase()) ||
    client.toLowerCase().includes(c.toLowerCase())
  );

  return isExisting ? 90 : 55;
}

/**
 * Score timing (0-100)
 */
function scoreTiming(bidDeadline, contractStart) {
  if (!bidDeadline) return 50;

  const now = new Date();
  const deadline = new Date(bidDeadline);
  const daysUntilDeadline = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));

  // Ideal: 30-90 days out
  if (daysUntilDeadline >= 30 && daysUntilDeadline <= 90) return 95;

  // Acceptable: 14-30 days or 90-180 days
  if (daysUntilDeadline >= 14 && daysUntilDeadline < 30) return 75;
  if (daysUntilDeadline > 90 && daysUntilDeadline <= 180) return 80;

  // Tight: less than 14 days
  if (daysUntilDeadline > 0 && daysUntilDeadline < 14) return 50;

  // Too far out or passed
  if (daysUntilDeadline > 180) return 60;
  return 30; // Deadline passed
}

/**
 * Estimate win probability based on score and sector
 */
function estimateWinProbability(totalScore, sector) {
  const sectorWinRate = COMPANY_PROFILE.expertise[sector]?.winRate || 0.15;

  // Adjust based on score
  let probability;
  if (totalScore >= 85) probability = sectorWinRate * 1.5;
  else if (totalScore >= 70) probability = sectorWinRate * 1.2;
  else if (totalScore >= 55) probability = sectorWinRate;
  else probability = sectorWinRate * 0.7;

  // Cap at realistic levels
  return Math.min(Math.round(probability * 100), 45);
}

/**
 * Generate bid recommendation
 */
function generateRecommendation(totalScore, scores, opportunity) {
  if (totalScore >= 80) {
    return {
      action: 'pursue',
      level: 'high',
      label: 'Strong Pursuit',
      color: '#10B981',
      reasoning: 'Strong fit across multiple factors. Recommend aggressive pursuit with senior engagement.'
    };
  } else if (totalScore >= 65) {
    return {
      action: 'pursue',
      level: 'medium',
      label: 'Pursue',
      color: '#F59E0B',
      reasoning: 'Good potential. Consider pursuing with targeted approach addressing weaker areas.'
    };
  } else if (totalScore >= 50) {
    return {
      action: 'selective',
      level: 'low',
      label: 'Selective',
      color: '#6B7280',
      reasoning: 'Mixed signals. Only pursue if strategic value outweighs resource investment.'
    };
  } else {
    return {
      action: 'decline',
      level: 'none',
      label: 'Low Priority',
      color: '#EF4444',
      reasoning: 'Poor fit. Consider declining unless specific strategic reasons exist.'
    };
  }
}

/**
 * Get competitor analysis for a sector
 */
function getCompetitorAnalysis(sector) {
  const competitors = COMPETITORS[sector] || [];

  return {
    sector,
    totalCompetitors: competitors.length,
    strongCompetitors: competitors.filter(c => c.strength === 'strong'),
    moderateCompetitors: competitors.filter(c => c.strength === 'moderate'),
    competitiveIntensity: competitors.filter(c => c.strength === 'strong').length >= 3 ? 'high' :
                          competitors.filter(c => c.strength === 'strong').length >= 2 ? 'medium' : 'low',
    topThreats: competitors.filter(c => c.strength === 'strong').slice(0, 3)
  };
}

/**
 * Generate strategic insights based on scores
 */
function generateStrategicInsights(scores, opportunity) {
  const insights = [];

  // Sector insight
  if (scores.sectorFit >= 80) {
    insights.push({
      type: 'strength',
      icon: '✓',
      text: `Strong sector expertise in ${opportunity.sector}. Leverage track record.`
    });
  } else if (scores.sectorFit < 60) {
    insights.push({
      type: 'weakness',
      icon: '!',
      text: `Limited ${opportunity.sector} sector experience. Consider teaming arrangement.`
    });
  }

  // Region insight
  if (scores.regionFit >= 80) {
    insights.push({
      type: 'strength',
      icon: '✓',
      text: `Strong regional presence in ${opportunity.region}. Local relationships are an asset.`
    });
  } else if (scores.regionFit < 70) {
    insights.push({
      type: 'action',
      icon: '→',
      text: `Consider local partner or highlight transferable regional experience.`
    });
  }

  // Value insight
  if (scores.valueFit >= 80) {
    insights.push({
      type: 'strength',
      icon: '✓',
      text: 'Contract value within ideal range. Right-sized for team capabilities.'
    });
  } else if (scores.valueFit < 50) {
    insights.push({
      type: 'warning',
      icon: '!',
      text: opportunity.value > COMPANY_PROFILE.sweetSpotValue.max * 2 ?
        'Large contract - expect intense competition. Differentiation critical.' :
        'Smaller contract - ensure margin viability before pursuing.'
    });
  }

  // Competition insight
  if (scores.competitionLevel < 60) {
    insights.push({
      type: 'warning',
      icon: '!',
      text: 'High competition expected. Need strong differentiation strategy.'
    });
  }

  // Timing insight
  if (scores.timing < 60) {
    insights.push({
      type: 'action',
      icon: '→',
      text: scores.timing < 50 ?
        'Tight timeline - assess resource availability before committing.' :
        'Long lead time - use for early engagement and relationship building.'
    });
  }

  // Client insight
  if (scores.clientRelationship >= 80) {
    insights.push({
      type: 'strength',
      icon: '✓',
      text: 'Existing client relationship provides competitive advantage.'
    });
  } else {
    insights.push({
      type: 'action',
      icon: '→',
      text: 'New client - prioritise early engagement and references.'
    });
  }

  return insights;
}

/**
 * Score all opportunities and return sorted by score
 */
export function scoreAllOpportunities(opportunities, context = {}) {
  return opportunities
    .map(opp => ({
      ...opp,
      intelligence: calculateBidScore(opp, context)
    }))
    .sort((a, b) => b.intelligence.totalScore - a.intelligence.totalScore);
}

/**
 * Get sector strength summary
 */
export function getSectorStrengths() {
  return Object.entries(COMPANY_PROFILE.expertise).map(([sector, data]) => ({
    sector,
    level: data.level,
    winRate: data.winRate,
    competitors: COMPETITORS[sector] || []
  }));
}

/**
 * Get all competitors across sectors
 */
export function getAllCompetitors() {
  const competitorMap = new Map();

  Object.entries(COMPETITORS).forEach(([sector, comps]) => {
    comps.forEach(comp => {
      if (!competitorMap.has(comp.name)) {
        competitorMap.set(comp.name, {
          name: comp.name,
          sectors: [],
          overallStrength: comp.strength
        });
      }
      competitorMap.get(comp.name).sectors.push({
        sector,
        strength: comp.strength,
        focus: comp.focus
      });
    });
  });

  return Array.from(competitorMap.values())
    .sort((a, b) => b.sectors.length - a.sectors.length);
}

/**
 * Get pipeline intelligence summary
 */
export function getPipelineIntelligence(opportunities, context = {}) {
  const scored = scoreAllOpportunities(opportunities, context);

  const strongPursuits = scored.filter(o => o.intelligence.totalScore >= 80);
  const pursuits = scored.filter(o => o.intelligence.totalScore >= 65 && o.intelligence.totalScore < 80);
  const selective = scored.filter(o => o.intelligence.totalScore >= 50 && o.intelligence.totalScore < 65);
  const lowPriority = scored.filter(o => o.intelligence.totalScore < 50);

  return {
    summary: {
      total: opportunities.length,
      strongPursuits: strongPursuits.length,
      pursuits: pursuits.length,
      selective: selective.length,
      lowPriority: lowPriority.length
    },
    totalValue: {
      strongPursuits: strongPursuits.reduce((sum, o) => sum + (o.value || 0), 0),
      pursuits: pursuits.reduce((sum, o) => sum + (o.value || 0), 0),
      selective: selective.reduce((sum, o) => sum + (o.value || 0), 0),
      lowPriority: lowPriority.reduce((sum, o) => sum + (o.value || 0), 0)
    },
    avgWinProbability: {
      strongPursuits: strongPursuits.length ? Math.round(strongPursuits.reduce((sum, o) => sum + o.intelligence.winProbability, 0) / strongPursuits.length) : 0,
      pursuits: pursuits.length ? Math.round(pursuits.reduce((sum, o) => sum + o.intelligence.winProbability, 0) / pursuits.length) : 0
    },
    topOpportunities: strongPursuits.slice(0, 5),
    opportunities: scored
  };
}
