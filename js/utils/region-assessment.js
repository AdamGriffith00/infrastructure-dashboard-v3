/**
 * Region Assessment - Q&A Logic and Scoring
 * Guided assessment to evaluate regional presence and investment decisions
 */

// Assessment question categories for regions
export const REGION_ASSESSMENT_SECTIONS = [
  {
    id: 'presence',
    title: 'Current Presence',
    icon: '🏢',
    questions: [
      {
        id: 'office_presence',
        question: 'Do we have an office in this region?',
        options: [
          { value: 3, label: 'Yes, established office with full team' },
          { value: 2, label: 'Yes, small office or satellite location' },
          { value: 1, label: 'No, but staff work remotely in the region' },
          { value: 0, label: 'No presence at all' }
        ],
        weight: 1.2,
        insight: 'Local presence significantly improves client relationships and win rates'
      },
      {
        id: 'staff_capacity',
        question: 'What is our staff capacity in or near this region?',
        options: [
          { value: 3, label: 'Strong - adequate team to handle growth' },
          { value: 2, label: 'Moderate - can service current workload' },
          { value: 1, label: 'Limited - stretched or travelling in' },
          { value: 0, label: 'None - would need to establish from scratch' }
        ],
        weight: 1.1,
        insight: 'Staff capacity determines ability to respond to opportunities'
      },
      {
        id: 'local_knowledge',
        question: 'How strong is our local market knowledge?',
        options: [
          { value: 3, label: 'Excellent - deep understanding of local dynamics' },
          { value: 2, label: 'Good - reasonable awareness of key players' },
          { value: 1, label: 'Basic - general awareness only' },
          { value: 0, label: 'Poor - limited knowledge of the region' }
        ],
        weight: 0.9,
        insight: 'Local knowledge helps identify opportunities early and bid effectively'
      }
    ]
  },
  {
    id: 'relationships',
    title: 'Client Relationships',
    icon: '🤝',
    questions: [
      {
        id: 'existing_clients',
        question: 'How many active client relationships do we have in this region?',
        options: [
          { value: 3, label: 'Many - well established with multiple clients' },
          { value: 2, label: 'Some - a few key client relationships' },
          { value: 1, label: 'Few - one or two relationships' },
          { value: 0, label: 'None - no existing client relationships' }
        ],
        weight: 1.3,
        insight: 'Existing relationships are the foundation for regional growth'
      },
      {
        id: 'client_satisfaction',
        question: 'How satisfied are our existing clients in this region?',
        options: [
          { value: 3, label: 'Very satisfied - strong references available' },
          { value: 2, label: 'Satisfied - positive relationships' },
          { value: 1, label: 'Mixed - some challenges' },
          { value: 0, label: 'N/A - no existing clients' }
        ],
        weight: 1.0,
        insight: 'Client satisfaction drives repeat business and referrals'
      },
      {
        id: 'framework_positions',
        question: 'Are we on relevant frameworks for this region?',
        options: [
          { value: 3, label: 'Yes, multiple key frameworks' },
          { value: 2, label: 'Yes, one or two frameworks' },
          { value: 1, label: 'No, but eligible to bid' },
          { value: 0, label: 'No, and not eligible currently' }
        ],
        weight: 1.1,
        insight: 'Framework positions provide consistent access to opportunities'
      }
    ]
  },
  {
    id: 'pipeline',
    title: 'Pipeline & Opportunity',
    icon: '📊',
    questions: [
      {
        id: 'pipeline_strength',
        question: 'How strong is our current pipeline in this region?',
        options: [
          { value: 3, label: 'Strong - significant opportunities identified' },
          { value: 2, label: 'Moderate - some opportunities in progress' },
          { value: 1, label: 'Weak - few opportunities identified' },
          { value: 0, label: 'Empty - no pipeline in this region' }
        ],
        weight: 1.2,
        insight: 'Pipeline strength indicates near-term revenue potential'
      },
      {
        id: 'win_rate',
        question: 'What is our historical win rate in this region?',
        options: [
          { value: 3, label: 'Above average - consistently winning' },
          { value: 2, label: 'Average - competitive performance' },
          { value: 1, label: 'Below average - struggling to win' },
          { value: 0, label: 'Unknown - insufficient history' }
        ],
        weight: 1.0,
        insight: 'Historical performance indicates competitive position'
      },
      {
        id: 'market_growth',
        question: 'What is the expected market growth in this region?',
        options: [
          { value: 3, label: 'High growth - major investment programmes' },
          { value: 2, label: 'Moderate growth - steady pipeline' },
          { value: 1, label: 'Flat - limited new investment' },
          { value: 0, label: 'Declining - reduced investment expected' }
        ],
        weight: 1.1,
        insight: 'Market growth determines long-term opportunity volume'
      }
    ]
  },
  {
    id: 'competition',
    title: 'Competitive Landscape',
    icon: '⚔️',
    questions: [
      {
        id: 'competitor_presence',
        question: 'How established are competitors in this region?',
        options: [
          { value: 3, label: 'Weak - limited competitor presence' },
          { value: 2, label: 'Moderate - some established competitors' },
          { value: 1, label: 'Strong - well-entrenched competitors' },
          { value: 0, label: 'Dominant - competitors own the market' }
        ],
        weight: 1.0,
        insight: 'Competitor strength affects win rates and pricing'
      },
      {
        id: 'differentiation',
        question: 'Can we differentiate from competitors in this region?',
        options: [
          { value: 3, label: 'Yes, clear unique advantages' },
          { value: 2, label: 'Somewhat, some differentiators' },
          { value: 1, label: 'Limited, similar to competitors' },
          { value: 0, label: 'No, commoditised market' }
        ],
        weight: 1.1,
        insight: 'Differentiation is key to winning in competitive markets'
      },
      {
        id: 'pricing_position',
        question: 'How competitive is our pricing in this region?',
        options: [
          { value: 3, label: 'Competitive with good margins' },
          { value: 2, label: 'Competitive but tight margins' },
          { value: 1, label: 'Higher than market, need to justify' },
          { value: 0, label: 'Uncompetitive, losing on price' }
        ],
        weight: 0.9,
        insight: 'Pricing position affects both win rates and profitability'
      }
    ]
  },
  {
    id: 'strategic',
    title: 'Strategic Importance',
    icon: '🎯',
    questions: [
      {
        id: 'strategic_priority',
        question: 'Is this region a strategic priority for growth?',
        options: [
          { value: 3, label: 'Yes, top priority region' },
          { value: 2, label: 'Yes, secondary priority' },
          { value: 1, label: 'Opportunistic, not a focus' },
          { value: 0, label: 'No, not aligned with strategy' }
        ],
        weight: 1.2,
        insight: 'Strategic alignment determines investment appetite'
      },
      {
        id: 'sector_alignment',
        question: 'Do the regional opportunities align with our sector strengths?',
        options: [
          { value: 3, label: 'Excellent alignment with core sectors' },
          { value: 2, label: 'Good alignment with some sectors' },
          { value: 1, label: 'Partial alignment' },
          { value: 0, label: 'Poor alignment with our expertise' }
        ],
        weight: 1.1,
        insight: 'Sector alignment improves win rates and delivery quality'
      },
      {
        id: 'investment_appetite',
        question: 'Is the business willing to invest in this region?',
        options: [
          { value: 3, label: 'Yes, significant investment approved' },
          { value: 2, label: 'Yes, moderate investment possible' },
          { value: 1, label: 'Limited, minimal investment only' },
          { value: 0, label: 'No, cost-neutral growth only' }
        ],
        weight: 1.0,
        insight: 'Investment appetite determines growth pace'
      }
    ]
  }
];

/**
 * Calculate region assessment score from answers
 */
export function calculateRegionScore(answers) {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const sectionScores = {};
  const strengths = [];
  const weaknesses = [];

  REGION_ASSESSMENT_SECTIONS.forEach(section => {
    let sectionScore = 0;
    let sectionWeight = 0;

    section.questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        const weightedScore = answer * question.weight;
        sectionScore += weightedScore;
        sectionWeight += question.weight * 3; // Max score is 3
        totalWeightedScore += weightedScore;
        totalWeight += question.weight * 3;

        // Track strengths and weaknesses
        if (answer >= 2) {
          strengths.push({
            question: question.question,
            answer: question.options.find(o => o.value === answer)?.label,
            section: section.title
          });
        } else if (answer <= 1) {
          weaknesses.push({
            question: question.question,
            answer: question.options.find(o => o.value === answer)?.label,
            section: section.title,
            insight: question.insight
          });
        }
      }
    });

    sectionScores[section.id] = {
      score: sectionWeight > 0 ? Math.round((sectionScore / sectionWeight) * 100) : 0,
      title: section.title,
      icon: section.icon
    };
  });

  const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;

  return {
    overallScore,
    sectionScores,
    strengths,
    weaknesses
  };
}

/**
 * Generate investment recommendation for a region
 */
export function generateRegionRecommendation(score, sectionScores, region, regionData) {
  const recommendation = {
    decision: '',
    confidence: '',
    summary: '',
    color: ''
  };

  // Determine decision based on score thresholds
  if (score >= 75) {
    recommendation.decision = 'INVEST & GROW';
    recommendation.confidence = 'High';
    recommendation.summary = 'Strong foundation for growth. Recommend increased investment to capture market opportunity.';
    recommendation.color = '#10B981';
  } else if (score >= 60) {
    recommendation.decision = 'STRENGTHEN POSITION';
    recommendation.confidence = 'Medium-High';
    recommendation.summary = 'Good base with room for improvement. Focus on addressing gaps before major expansion.';
    recommendation.color = '#10B981';
  } else if (score >= 45) {
    recommendation.decision = 'SELECTIVE INVESTMENT';
    recommendation.confidence = 'Medium';
    recommendation.summary = 'Mixed picture. Invest selectively in specific opportunities while building foundations.';
    recommendation.color = '#F59E0B';
  } else if (score >= 30) {
    recommendation.decision = 'BUILD FOUNDATIONS';
    recommendation.confidence = 'Low-Medium';
    recommendation.summary = 'Significant gaps to address. Focus on establishing basics before pursuing growth.';
    recommendation.color = '#F59E0B';
  } else {
    recommendation.decision = 'DEPRIORITISE';
    recommendation.confidence = 'High';
    recommendation.summary = 'Region does not align with current capabilities or strategy. Consider resource reallocation.';
    recommendation.color = '#EF4444';
  }

  // Check for critical gaps that override the score
  if (sectionScores.presence?.score < 30 && score >= 45) {
    recommendation.decision = 'BUILD FOUNDATIONS';
    recommendation.summary = 'Limited presence is a critical gap. Establish local capability before pursuing growth.';
    recommendation.color = '#F59E0B';
  }

  if (sectionScores.relationships?.score < 30 && score >= 45) {
    recommendation.decision = 'BUILD FOUNDATIONS';
    recommendation.summary = 'Weak client relationships are a critical gap. Focus on relationship building first.';
    recommendation.color = '#F59E0B';
  }

  return recommendation;
}

/**
 * Generate action plan for region
 */
export function generateRegionActionPlan(score, sectionScores, strengths, weaknesses, region) {
  const actions = [];
  const investments = [];

  // Generate actions based on weaknesses
  weaknesses.forEach(weakness => {
    if (weakness.section === 'Current Presence') {
      if (weakness.question.includes('office')) {
        actions.push({
          priority: 'high',
          action: 'Evaluate options for establishing local presence (office, co-working, or key hire)',
          owner: 'Regional Director',
          timeframe: '3 months',
          investment: 'Medium-High'
        });
      }
      if (weakness.question.includes('staff')) {
        actions.push({
          priority: 'high',
          action: 'Develop recruitment plan for regional capability',
          owner: 'HR / Operations',
          timeframe: '6 months',
          investment: 'High'
        });
      }
      if (weakness.question.includes('knowledge')) {
        actions.push({
          priority: 'medium',
          action: 'Assign regional champion to build market intelligence',
          owner: 'Business Development',
          timeframe: '1 month',
          investment: 'Low'
        });
      }
    }

    if (weakness.section === 'Client Relationships') {
      if (weakness.question.includes('active client')) {
        actions.push({
          priority: 'high',
          action: 'Identify top 10 target clients and develop pursuit plans',
          owner: 'BD Lead',
          timeframe: '1 month',
          investment: 'Low'
        });
      }
      if (weakness.question.includes('framework')) {
        actions.push({
          priority: 'high',
          action: 'Map relevant frameworks and plan submissions',
          owner: 'Bid Team',
          timeframe: '3 months',
          investment: 'Medium'
        });
      }
    }

    if (weakness.section === 'Pipeline & Opportunity') {
      if (weakness.question.includes('pipeline')) {
        actions.push({
          priority: 'high',
          action: 'Increase BD activity in region - networking, events, direct outreach',
          owner: 'BD Team',
          timeframe: 'Ongoing',
          investment: 'Medium'
        });
      }
      if (weakness.question.includes('win rate')) {
        actions.push({
          priority: 'medium',
          action: 'Review lost bids to identify improvement areas',
          owner: 'Bid Manager',
          timeframe: '1 month',
          investment: 'Low'
        });
      }
    }

    if (weakness.section === 'Competitive Landscape') {
      if (weakness.question.includes('differentiate')) {
        actions.push({
          priority: 'medium',
          action: 'Develop regional value proposition highlighting unique strengths',
          owner: 'Marketing',
          timeframe: '2 months',
          investment: 'Low'
        });
      }
    }
  });

  // Investment recommendations based on score
  if (score >= 60) {
    investments.push({
      type: 'Growth Investment',
      description: 'Increase headcount and BD activity to capture growth',
      level: 'High',
      expectedROI: 'Strong pipeline growth within 12 months'
    });
  } else if (score >= 40) {
    investments.push({
      type: 'Foundation Building',
      description: 'Targeted investment to address gaps before scaling',
      level: 'Medium',
      expectedROI: 'Improved win rates within 6-12 months'
    });
  } else {
    investments.push({
      type: 'Minimal Investment',
      description: 'Opportunistic approach only - no dedicated investment',
      level: 'Low',
      expectedROI: 'Maintain current position'
    });
  }

  // Sort actions by priority
  actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return { actions, investments };
}

/**
 * Generate growth strategy for region
 */
export function generateRegionStrategy(strengths, weaknesses, region, regionData) {
  const strategy = {
    theme: '',
    objectives: [],
    quickWins: [],
    longTermPlays: []
  };

  // Determine theme based on strengths
  const presenceStrengths = strengths.filter(s => s.section === 'Current Presence');
  const relationshipStrengths = strengths.filter(s => s.section === 'Client Relationships');
  const pipelineStrengths = strengths.filter(s => s.section === 'Pipeline & Opportunity');

  if (presenceStrengths.length >= 2 && relationshipStrengths.length >= 1) {
    strategy.theme = 'Accelerate Growth';
    strategy.objectives = [
      'Increase market share in existing sectors',
      'Expand into adjacent sectors',
      'Grow key client relationships'
    ];
  } else if (relationshipStrengths.length >= 2) {
    strategy.theme = 'Deepen Relationships';
    strategy.objectives = [
      'Expand work with existing clients',
      'Leverage references for new client wins',
      'Build presence through client secondments'
    ];
  } else if (pipelineStrengths.length >= 1) {
    strategy.theme = 'Convert Pipeline';
    strategy.objectives = [
      'Focus resources on winning active opportunities',
      'Build case studies from successful projects',
      'Establish reputation through delivery excellence'
    ];
  } else {
    strategy.theme = 'Establish Foundations';
    strategy.objectives = [
      'Build basic market presence',
      'Develop initial client relationships',
      'Create regional go-to-market plan'
    ];
  }

  // Quick wins (can be done in <3 months)
  strategy.quickWins = [
    'Assign regional champion from existing staff',
    'Map all current opportunities and set pursuit priorities',
    'Identify networking events and industry forums',
    'Review competitor positioning and pricing'
  ];

  // Long-term plays (6-18 months)
  if (regionData?.budget10Year > 5000000000) {
    strategy.longTermPlays = [
      'Establish dedicated office presence',
      'Build team of 5+ regional specialists',
      'Secure position on 3+ key frameworks',
      'Develop signature project credentials'
    ];
  } else {
    strategy.longTermPlays = [
      'Build virtual team with regional focus',
      'Develop partnerships with local firms',
      'Target 2-3 strategic framework positions',
      'Build portfolio of regional case studies'
    ];
  }

  return strategy;
}

/**
 * Get full region assessment result
 */
export function getRegionAssessmentResult(answers, region, regionData) {
  const { overallScore, sectionScores, strengths, weaknesses } = calculateRegionScore(answers);
  const recommendation = generateRegionRecommendation(overallScore, sectionScores, region, regionData);
  const actionPlan = generateRegionActionPlan(overallScore, sectionScores, strengths, weaknesses, region);
  const strategy = generateRegionStrategy(strengths, weaknesses, region, regionData);

  return {
    score: overallScore,
    sectionScores,
    recommendation,
    strengths,
    weaknesses,
    actionPlan,
    strategy,
    region,
    regionData
  };
}
