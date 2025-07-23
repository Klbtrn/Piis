class SpacedRepetitionSystem {
  static BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 120, 240];
  
  /**
   * Calculate performance score based on user interaction
   * Returns value between 0 (worst) and 1 (perfect)
   */
  static calculatePerformanceScore(hintsUsed, hintCount, attempts) {
    // Hint penalty: 0.3 per hint used
    const hintPenalty = (hintsUsed / hintCount) * 0.6;
    
    // Attempt penalty: decreases with each additional attempt
    const attemptPenalty = Math.min((attempts - 1) * 0.2, 0.4);
    
    return Math.max(0, 1 - hintPenalty - attemptPenalty);
  }
  
  /**
   * Update difficulty factor based on performance
   * Better performance = higher factor = longer intervals
   */
  static updateDifficultyFactor(currentFactor, performanceScore) {
    // Performance thresholds
    const adjustment = performanceScore >= 0.8 ? 0.15 :  // Perfect/great: increase
                      performanceScore >= 0.6 ? 0.05 :   // Good: slight increase  
                      performanceScore >= 0.4 ? -0.05 :  // Okay: slight decrease
                                                -0.2;     // Poor: significant decrease
    
    const newFactor = currentFactor + adjustment;
    return Math.max(1.3, Math.min(5.0, newFactor)); // Clamp between 1.3 and 5.0
  }
  
  /**
   * Calculate next interval based on current interval and difficulty
   */
  static calculateNextInterval(currentInterval, difficultyFactor, successfulReviews) {
    if (successfulReviews === 0) return 1; // First review after 1 day
    if (successfulReviews === 1) return 3; // Second review after 3 days
    
    // For subsequent reviews, use exponential growth with difficulty factor
    return Math.round(currentInterval * difficultyFactor);
  }
  
  /**
   * Process a completed flashcard and update spaced repetition data
   */
  static processCardCompletion(flashcard) {
    const now = new Date();
    const attempts = (flashcard.attempts || 0) + 1;
    const successfulReviews = (flashcard.successfulReviews || 0) + 1;
    const hintsUsedOverall = (flashcard.hintsUsedOverall || 0) + (flashcard.hintsUsed || 0);
    
    const performanceScore = SpacedRepetitionSystem.calculatePerformanceScore(
      flashcard.hintsUsed || 0,
      flashcard.hintCount || 2,
      attempts
    );
    
    const newDifficultyFactor = SpacedRepetitionSystem.updateDifficultyFactor(
      flashcard.difficultyFactor || 2.5,
      performanceScore
    );
    
    const nextInterval = SpacedRepetitionSystem.calculateNextInterval(
      flashcard.currentInterval || 1,
      newDifficultyFactor,
      successfulReviews
    );
    
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    
    return {
      ...flashcard,
      attempts,
      successfulReviews,
      hintsUsedOverall,
      lastReviewDate: now,
      nextReviewDate,
      difficultyFactor: newDifficultyFactor,
      currentInterval: nextInterval,
      // Reset for next attempt
      hintsUsed: 0,
      editorContent: ''
    };
  }
  
  /**
   * Check which cards should be moved from Done to Repeat
   * Call this periodically (e.g., on app startup, daily cron job)
   */
  static getCardsForReview(flashcards) {
    const now = new Date();
    return flashcards.filter(card => 
      card.nextReviewDate && 
      new Date(card.nextReviewDate) <= now
    );
  }
  
  /**
   * Move cards that are due for review back to Repeat status
   */
  static async moveCardsToReview(flashcards) {
    const cardsToReview = SpacedRepetitionSystem.getCardsForReview(flashcards);
    
    for (const card of cardsToReview) {
      try {
        await fetch(`http://localhost:5000/api/flashcards/${card._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...card, status: 'Repeat' })
        });
      } catch (error) {
        console.error('Failed to move card to review:', error);
      }
    }
    
    return cardsToReview.length;
  }
  
  /**
   * Get statistics about spaced repetition performance
   */
  static getSpacedRepetitionStats(flashcards) {
    const doneCards = flashcards.filter(c => c.status === 'Done');
    const cardsForReview = SpacedRepetitionSystem.getCardsForReview(flashcards);
    
    const avgPerformance = doneCards.length > 0 ? 
      doneCards.reduce((sum, card) => {
        const score = SpacedRepetitionSystem.calculatePerformanceScore(
          card.hintsUsed || 0,
          card.hintCount || 2,
          card.attempts || 1
        );
        return sum + score;
      }, 0) / doneCards.length : 0;
    
    const upcoming = doneCards.filter(card => {
      if (!card.nextReviewDate) return false;
      const reviewDate = new Date(card.nextReviewDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return reviewDate <= weekFromNow;
    });
    
    return {
      totalDoneCards: doneCards.length,
      cardsForReviewToday: cardsForReview.length,
      upcomingThisWeek: upcoming.length,
      averagePerformance: (avgPerformance * 100).toFixed(1) + '%',
      averageDifficulty: doneCards.length > 0 ? 
        (doneCards.reduce((sum, c) => sum + (c.difficultyFactor || 2.5), 0) / doneCards.length).toFixed(2) : '2.50'
    };
  }
}

export default SpacedRepetitionSystem;