/**
 * Opportunity Assessment - Q&A Logic and Scoring
 * Guided assessment to help decide go/no-go on opportunities
 */

// Assessment question categories
export const ASSESSMENT_SECTIONS = [
  {
    id: 'capability',
    title: 'Capability Check',
    icon: '🎯',
    questions: [
      {
        id: 'client_experience',
        question: 'Have we worked with this client before?',
        options: [
          { value: 3, label: 'Yes, strong ongoing relationship' },
          { value: 2, label: 'Yes, but limited or past engagement' },
          { value: 1, label: 'No, but we have contacts/connections' },
          { value: 0, label: 'No relationship at all' }
        ],
        weight: 1.2,
        insight: 'Client relationships significantly impact win rates'
      },
      {
        id: 'sector_experience',
        question: 'How much experience do we have in this sector?',
        options: [
          { value: 3, label: 'Extensive - multiple similar projects delivered' },
          { value: 2, label: 'Moderate - some relevant experience' },
          { value: 1, label: 'Limited - but transferable skills' },
          { value: 0, label: 'None - new sector for us' }
        ],
        weight: 1.3,
        insight: 'Demonstrable experience is often a key evaluation criterion'
      },
      {
        id: 'technical_skills',
        question: 'Do we have the specialist skills this project requires?',
        options: [
          { value: 3, label: 'Yes, all skills in-house' },
          { value: 2, label: 'Mostly, may need minor support' },
          { value: 1, label: 'Partially, would need to partner' },
          { value: 0, label: 'No, significant gaps' }
        ],
        weight: 1.1,
        insight: 'Technical capability gaps can be addressed through partnerships'
      }
    ]
  },
  {
    id: 'resources',
    title: 'Resource Availability',
    icon: '👥',
    questions: [
      {
        id: 'bid_team',
        question: 'Can we field a strong bid team for this opportunity?',
        options: [
          { value: 3, label: 'Yes, A-team available' },
          { value: 2, label: 'Yes, good team available' },
          { value: 1, label: 'Stretched, but manageable' },
          { value: 0, label: 'No, key people unavailable' }
        ],
        weight: 1.0,
        insight: 'Bid quality directly correlates with team strength'
      },
      {
        id: 'delivery_capacity',
        question: 'If we win, do we have capacity to deliver?',
        options: [
          { value: 3, label: 'Yes, can mobilise immediately' },
          { value: 2, label: 'Yes, with some reallocation' },
          { value: 1, label: 'Tight, would need to recruit' },
          { value: 0, label: 'No, over-committed currently' }
        ],
        weight: 1.2,
        insight: 'Winning work you cannot deliver damages reputation'
      },
      {
        id: 'geographic_presence',
        question: 'Do we have presence in the project region?',
        options: [
          { value: 3, label: 'Yes, established local office' },
          { value: 2, label: 'Yes, nearby office or remote team' },
          { value: 1, label: 'No, but willing to establish' },
          { value: 0, label: 'No, and logistically difficult' }
        ],
        weight: 0.8,
        insight: 'Local presence can be a differentiator for clients'
      }
    ]
  },
  {
    id: 'strategic',
    title: 'Strategic Fit',
    icon: '📈',
    questions: [
      {
        id: 'target_client',
        question: 'Is this a strategically important client for us?',
        options: [
          { value: 3, label: 'Yes, top target client' },
          { value: 2, label: 'Yes, growth target' },
          { value: 1, label: 'Neutral, opportunistic' },
          { value: 0, label: 'No, not aligned with strategy' }
        ],
        weight: 1.0,
        insight: 'Strategic clients may warrant investment even at lower margins'
      },
      {
        id: 'sector_strategy',
        question: 'Does this align with our sector growth strategy?',
        options: [
          { value: 3, label: 'Yes, core growth sector' },
          { value: 2, label: 'Yes, complementary sector' },
          { value: 1, label: 'Neutral' },
          { value: 0, label: 'No, divesting from this sector' }
        ],
        weight: 0.9,
        insight: 'Strategic alignment affects long-term value'
      },
      {
        id: 'reference_value',
        question: 'Would winning this enhance our credentials?',
        options: [
          { value: 3, label: 'Yes, landmark/flagship project' },
          { value: 2, label: 'Yes, good portfolio addition' },
          { value: 1, label: 'Standard, routine project' },
          { value: 0, label: 'No, potentially reputational risk' }
        ],
        weight: 0.8,
        insight: 'Reference projects open doors to future work'
      }
    ]
  },
  {
    id: 'competitive',
    title: 'Competitive Position',
    icon: '⚔️',
    questions: [
      {
        id: 'competitor_landscape',
        question: 'How competitive is this opportunity?',
        options: [
          { value: 3, label: 'Limited competition expected' },
          { value: 2, label: 'Moderate - 3-5 credible bidders' },
          { value: 1, label: 'Highly competitive - many bidders' },
          { value: 0, label: 'Incumbent strongly favoured' }
        ],
        weight: 1.1,
        insight: 'Competition level affects win probability and pricing'
      },
      {
        id: 'differentiator',
        question: 'Do we have a clear differentiator for this bid?',
        options: [
          { value: 3, label: 'Yes, unique value proposition' },
          { value: 2, label: 'Yes, some competitive advantages' },
          { value: 1, label: 'Limited, similar to competitors' },
          { value: 0, label: 'No, we would be an outsider' }
        ],
        weight: 1.2,
        insight: 'Clear differentiation is key to winning competitive bids'
      },
      {
        id: 'price_position',
        question: 'Can we be competitive on price?',
        options: [
          { value: 3, label: 'Yes, and maintain good margins' },
          { value: 2, label: 'Yes, with acceptable margins' },
          { value: 1, label: 'Tight, may need to be aggressive' },
          { value: 0, label: 'No, our rates are too high' }
        ],
        weight: 1.0,
        insight: 'Price competitiveness varies by sector and client'
      }
    ]
  },
  {
    id: 'commercial',
    title: 'Commercial Viability',
    icon: '💰',
    questions: [
      {
        id: 'fee_potential',
        question: 'What is the fee potential relative to bid cost?',
        options: [
          { value: 3, label: 'High - excellent ROI on bid investment' },
          { value: 2, label: 'Good - reasonable return expected' },
          { value: 1, label: 'Marginal - low fee or high bid cost' },
          { value: 0, label: 'Poor - bid cost may exceed fees' }
        ],
        weight: 1.1,
        insight: 'Bid investment should be proportional to opportunity value'
      },
      {
        id: 'payment_terms',
        question: 'Are the expected payment terms acceptable?',
        options: [
          { value: 3, label: 'Yes, standard or better terms' },
          { value: 2, label: 'Acceptable with some caveats' },
          { value: 1, label: 'Challenging but manageable' },
          { value: 0, label: 'Unacceptable terms expected' }
        ],
        weight: 0.7,
        insight: 'Payment terms affect cash flow and risk'
      },
      {
        id: 'follow_on',
        question: 'Is there potential for follow-on work?',
        options: [
          { value: 3, label: 'Yes, significant pipeline potential' },
          { value: 2, label: 'Yes, some additional phases likely' },
          { value: 1, label: 'Possibly, depends on performance' },
          { value: 0, label: 'No, one-off engagement' }
        ],
        weight: 0.9,
        insight: 'Follow-on potential increases lifetime value'
      }
    ]
  }
];

/**
 * Calculate assessment score from answers
 */
export function calculateAssessmentScore(answers) {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const sectionScores = {};
  const insights = [];
  const strengths = [];
  const weaknesses = [];

  ASSESSMENT_SECTIONS.forEach(section => {
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
 * Generate go/no-go recommendation
 */
export function generateGoNoGoRecommendation(score, sectionScores, opportunity) {
  const recommendation = {
    decision: '',
    confidence: '',
    summary: '',
    color: ''
  };

  // Determine decision based on score thresholds
  if (score >= 75) {
    recommendation.decision = 'STRONG GO';
    recommendation.confidence = 'High';
    recommendation.summary = 'This opportunity aligns well with our capabilities and strategy. Recommend prioritising this bid.';
    recommendation.color = 'success';
  } else if (score >= 60) {
    recommendation.decision = 'GO';
    recommendation.confidence = 'Medium-High';
    recommendation.summary = 'Good fit overall with manageable gaps. Recommend proceeding with targeted mitigation.';
    recommendation.color = 'success';
  } else if (score >= 45) {
    recommendation.decision = 'SELECTIVE GO';
    recommendation.confidence = 'Medium';
    recommendation.summary = 'Mixed fit - proceed only if strategic value justifies investment or gaps can be addressed.';
    recommendation.color = 'warning';
  } else if (score >= 30) {
    recommendation.decision = 'CONDITIONAL';
    recommendation.confidence = 'Low-Medium';
    recommendation.summary = 'Significant concerns identified. Only proceed if critical gaps can be resolved.';
    recommendation.color = 'warning';
  } else {
    recommendation.decision = 'NO GO';
    recommendation.confidence = 'High';
    recommendation.summary = 'Poor fit with current capabilities and strategy. Recommend declining this opportunity.';
    recommendation.color = 'danger';
  }

  // Check for any critical weaknesses that override score
  const criticalSections = ['capability', 'resources'];
  for (const section of criticalSections) {
    if (sectionScores[section]?.score < 30 && score >= 45) {
      recommendation.decision = 'CONDITIONAL';
      recommendation.confidence = 'Reduced';
      recommendation.summary = `Warning: Critical weakness in ${sectionScores[section].title}. Address before proceeding.`;
      recommendation.color = 'warning';
      break;
    }
  }

  return recommendation;
}

/**
 * Generate action plan based on assessment
 */
export function generateActionPlan(score, sectionScores, strengths, weaknesses, opportunity) {
  const actions = [];
  const timeline = [];

  // Immediate actions based on weaknesses
  weaknesses.forEach(weakness => {
    if (weakness.section === 'Capability Check') {
      if (weakness.question.includes('client')) {
        actions.push({
          priority: 'high',
          action: 'Identify client contacts and arrange introductory meeting',
          owner: 'BD Lead',
          timeframe: 'This week'
        });
      }
      if (weakness.question.includes('sector')) {
        actions.push({
          priority: 'high',
          action: 'Compile relevant case studies from adjacent sectors',
          owner: 'Bid Manager',
          timeframe: 'Before bid submission'
        });
      }
      if (weakness.question.includes('skills')) {
        actions.push({
          priority: 'high',
          action: 'Identify potential specialist partners or subconsultants',
          owner: 'Technical Lead',
          timeframe: 'Within 1 week'
        });
      }
    }

    if (weakness.section === 'Resource Availability') {
      if (weakness.question.includes('bid team')) {
        actions.push({
          priority: 'high',
          action: 'Review resource allocation and escalate conflicts',
          owner: 'Resource Manager',
          timeframe: 'Immediately'
        });
      }
      if (weakness.question.includes('capacity')) {
        actions.push({
          priority: 'medium',
          action: 'Develop recruitment/mobilisation contingency plan',
          owner: 'HR / Operations',
          timeframe: 'Before bid submission'
        });
      }
    }

    if (weakness.section === 'Competitive Position') {
      if (weakness.question.includes('differentiator')) {
        actions.push({
          priority: 'high',
          action: 'Workshop to identify and articulate unique value proposition',
          owner: 'Bid Team',
          timeframe: 'Week 1 of bid'
        });
      }
      if (weakness.question.includes('price')) {
        actions.push({
          priority: 'medium',
          action: 'Review pricing strategy and identify efficiency opportunities',
          owner: 'Commercial Lead',
          timeframe: 'Before pricing'
        });
      }
    }
  });

  // Standard actions for all GO decisions
  if (score >= 45) {
    timeline.push({ phase: 'Week 1', activities: ['Confirm bid team', 'Client engagement', 'Competitor analysis'] });
    timeline.push({ phase: 'Week 2-3', activities: ['Solution development', 'Case study selection', 'Draft response'] });
    timeline.push({ phase: 'Week 4', activities: ['Internal review', 'Pricing finalisation', 'Quality check'] });
    timeline.push({ phase: 'Final', activities: ['Management sign-off', 'Submission', 'Follow-up plan'] });
  }

  // Add strength-based actions
  strengths.slice(0, 3).forEach(strength => {
    if (strength.section === 'Strategic Fit') {
      actions.push({
        priority: 'medium',
        action: 'Highlight strategic alignment in executive summary',
        owner: 'Bid Manager',
        timeframe: 'During bid writing'
      });
    }
  });

  // Sort by priority
  actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return { actions, timeline };
}

/**
 * Generate win strategy based on assessment
 */
export function generateWinStrategy(strengths, weaknesses, opportunity) {
  const strategy = {
    theme: '',
    keyMessages: [],
    differentiators: [],
    mitigations: []
  };

  // Determine theme based on top strengths
  const capabilityStrengths = strengths.filter(s => s.section === 'Capability Check');
  const strategicStrengths = strengths.filter(s => s.section === 'Strategic Fit');

  if (capabilityStrengths.length >= 2) {
    strategy.theme = 'Deep Expertise & Proven Track Record';
    strategy.keyMessages.push('Demonstrate extensive relevant experience');
    strategy.keyMessages.push('Lead with case studies and testimonials');
  } else if (strategicStrengths.length >= 2) {
    strategy.theme = 'Strategic Partnership & Long-term Value';
    strategy.keyMessages.push('Position as strategic partner, not just supplier');
    strategy.keyMessages.push('Emphasise commitment to client success');
  } else {
    strategy.theme = 'Right Team, Right Approach';
    strategy.keyMessages.push('Focus on team quality and methodology');
    strategy.keyMessages.push('Demonstrate understanding of client needs');
  }

  // Extract differentiators from strengths
  strengths.forEach(strength => {
    if (strength.answer?.includes('strong') || strength.answer?.includes('extensive') || strength.answer?.includes('unique')) {
      strategy.differentiators.push(strength.answer);
    }
  });

  // Generate mitigations for weaknesses
  weaknesses.forEach(weakness => {
    strategy.mitigations.push({
      issue: weakness.question,
      mitigation: weakness.insight,
      status: 'To address'
    });
  });

  return strategy;
}

/**
 * Get full assessment result
 */
export function getAssessmentResult(answers, opportunity) {
  const { overallScore, sectionScores, strengths, weaknesses } = calculateAssessmentScore(answers);
  const recommendation = generateGoNoGoRecommendation(overallScore, sectionScores, opportunity);
  const actionPlan = generateActionPlan(overallScore, sectionScores, strengths, weaknesses, opportunity);
  const winStrategy = generateWinStrategy(strengths, weaknesses, opportunity);

  return {
    score: overallScore,
    sectionScores,
    recommendation,
    strengths,
    weaknesses,
    actionPlan,
    winStrategy,
    opportunity
  };
}
