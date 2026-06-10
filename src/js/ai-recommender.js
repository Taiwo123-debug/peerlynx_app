// ai-recommender.js

const RELATED_SYNONYMS = {
    "python": ["data", "machine learning", "ai", "backend", "coding", "django", "flask", "programming", "software"],
    "javascript": ["web", "frontend", "react", "node", "html", "css", "programming", "nextjs", "software", "script"],
    "react": ["web", "frontend", "javascript", "ui", "ux", "nextjs", "app"],
    "design": ["ui", "ux", "figma", "graphic", "creative", "photoshop", "illustrator", "art", "web"],
    "ui": ["ux", "design", "figma", "product", "frontend", "web", "interface"],
    "ux": ["ui", "design", "figma", "research", "product", "experience"],
    "marketing": ["seo", "digital", "business", "social media", "content", "sales", "growth"],
    "data": ["python", "sql", "excel", "analytics", "database", "powerbi", "science", "analysis"]
};

function tokenize(skillName) {
    return skillName.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, ' ') 
        .split(/\s+/)
        .filter(word => word.length > 1); 
}

/**
 * Calculates a loose relational score between student and tutor skills
 */
function calculateRelationScore(studentSkillName, tutorSkillName) {
    const studentTokens = tokenize(studentSkillName);
    const tutorTokens = tokenize(tutorSkillName);

    let matchCount = 0;

    studentTokens.forEach(sToken => {
        tutorTokens.forEach(tToken => {
            // 1. Direct match or partial character overlap (Extremely forgiving)
            if (sToken === tToken || sToken.includes(tToken) || tToken.includes(sToken)) {
                matchCount += 1.0; 
            }

            // 2. Cross-reference synonyms
            if (RELATED_SYNONYMS[sToken] && RELATED_SYNONYMS[sToken].includes(tToken)) {
                matchCount += 0.8; // Bumped up weight to make matches even easier
            }
        });
    });

    return matchCount;
}

/**
 * Fast client-side relationship filtering with a highly relaxed default threshold
 * @param {number} threshold - Dropped to 0.2 for a very broad, loose match
 */
export async function filterRelatedSkills(studentSkills, tutorSkills, threshold = 0.2) {
    // If student has no skills yet, show everything as default
    if (!studentSkills || studentSkills.length === 0) {
        return tutorSkills;
    }

    const relatedSkills = [];

    for (const tutorSkill of tutorSkills) {
        // Exact duplicate check (Skip if they already registered for this exact class)
        const isAlreadySelected = studentSkills.some(studentSkill => 
            studentSkill.skill_name === tutorSkill.skill_name && 
            studentSkill.tutor_email === tutorSkill.tutor_email
        );
        if (isAlreadySelected) continue;

        let highestScore = 0;
        for (const studentSkill of studentSkills) {
            const score = calculateRelationScore(studentSkill.skill_name, tutorSkill.skill_name);
            if (score > highestScore) {
                highestScore = score;
            }
        }

        // If it passes our low threshold baseline, include it
        if (highestScore >= threshold) {
            relatedSkills.push(tutorSkill);
        }
    }

    return relatedSkills;
}