import React, { useState, useEffect } from 'react';
import { Game } from '../../game/Game';
import { ProgressBar } from '../ProgressBar';

interface ResearchTabProps {
  game: Game;
  completedResearch: string[];
  activeResearch: {
    id: string | null;
    startTime: number;
    duration: number;
  };
}

export const ResearchTab: React.FC<ResearchTabProps> = ({ game, completedResearch, activeResearch }) => {
  //Force re-render to update progress bars
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleStartResearch = (researchId: string) => {
    const success = game.researchManager.startResearch(researchId as any);
    
    if (success) {
      //Trigger UI update
      document.dispatchEvent(new Event('game-state-changed'));
    }
  };
  
  const handleCancelResearch = () => {
    game.researchManager.cancelResearch();
    document.dispatchEvent(new Event('game-state-changed'));
  };
  
  //Get available research
  const availableResearch = game.researchManager.getAvailableResearch();
  
  //Calculate research progress
  const getResearchProgress = (): number => {
    if (!activeResearch.id) return 0;
    
    const elapsed = Date.now() - activeResearch.startTime;
    return Math.min(100, Math.max(0, (elapsed / activeResearch.duration) * 100));
  };
  
  //Get remaining time
  const getRemainingTime = (): string => {
    if (!activeResearch.id) return '';
    
    const elapsed = Date.now() - activeResearch.startTime;
    const remaining = Math.max(0, activeResearch.duration - elapsed);
    return game.timeManager.getFormattedTime(remaining);
  };
  
  //Create ASCII progress bar
  const getAsciiProgressBar = (): string => {
    if (!activeResearch.id) return '';
    
    const progress = getResearchProgress();
    const totalBars = 30;
    const filledBars = Math.floor((progress / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    
    return `[${'\u2588'.repeat(filledBars)}${'\u2591'.repeat(emptyBars)}] ${Math.round(progress)}%`;
  };
  
  //Check if player meets requirements for research
  const canStartResearch = (researchId: string): boolean => {
    const research = game.researchManager.getResearch(researchId as any);
    if (!research) return false;
    
    //Check if another research is already active
    if (activeResearch.id) {
      return false;
    }
    
    return research.requirements.every(req => {
      switch (req.type) {
        case 'research':
          return completedResearch.includes(req.id);
        
        case 'component':
          return game.componentManager.getComponentAmount(req.id as any) >= (req.amount || 0);
        
        case 'resource':
          return game.resourceManager.getResourceAmount(req.id as any) >= (req.amount || 0);
        
        default:
          return false;
      }
    });
  };
  
  //Check if research has been completed before
  const isResearchCompleted = (researchId: string): boolean => {
    return completedResearch.includes(researchId);
  };
  
  //Get research completion count
  const getResearchCompletionCount = (researchId: string): number => {
    return game.researchManager.getResearchCompletionCount(researchId as any);
  };
  
  return (
    <div className="research-tab">
      <h2>Research</h2>
      
      {/* Active Research */}
      <div className="research-section">
        <h3>Active Research</h3>
        <div className="active-research">
          {activeResearch.id ? (
            <>
              {(() => {
                const research = game.researchManager.getResearch(activeResearch.id as any);
                if (!research) return <div>No active research</div>;
                
                return (
                  <>
                    <div className="research-name">{research.name}</div>
                    <div className="research-description">{research.description}</div>
                  </>
                );
              })()}
              
              <ProgressBar 
                progress={getResearchProgress()}
                height={20}
                showText={true}
                customText={`${Math.round(getResearchProgress())}% - ${getRemainingTime()} remaining`}
              />
              
              <div className="ascii-progress">
                {getAsciiProgressBar()}
              </div>
              
              <button 
                id="cancel-research"
                onClick={handleCancelResearch}
              >
                Cancel Research
              </button>
            </>
          ) : (
            <div>No active research</div>
          )}
        </div>
      </div>
      
      {/* Available Research */}
      <div className="research-section">
        <h3>Available Research</h3>
        <div className="available-research">
          {availableResearch.length === 0 ? (
            <div>No research available</div>
          ) : (
            availableResearch.map(research => {
              const canStart = canStartResearch(research.id);
              const alreadyCompleted = isResearchCompleted(research.id);
              const completionCount = getResearchCompletionCount(research.id);
              
              return (
                <div className="research-item" key={research.id}>
                  <div className="research-header">
                    <span className="research-name">{research.name}</span>
                    {alreadyCompleted && <span className="research-completed-tag">COMPLETED</span>}
                    {completionCount > 0 && <span className="research-count">×{completionCount}</span>}
                  </div>
                  <div className="research-description">{research.description}</div>
                  <div className="research-time">Time: {research.getFormattedDuration()}</div>
                  
                  {/* Requirements */}
                  {research.requirements.length > 0 && (
                    <div className="research-requirements">
                      Requirements: 
                      {research.requirements.map((req, index) => {
                        let reqText = '';
                        let isMet = false;
                        
                        switch (req.type) {
                          case 'research':
                            const reqResearch = game.researchManager.getResearch(req.id as any);
                            reqText = reqResearch ? reqResearch.name : req.id;
                            isMet = completedResearch.includes(req.id);
                            break;
                          
                          case 'component':
                            const component = game.componentManager.getComponent(req.id as any);
                            const compAmount = game.componentManager.getComponentAmount(req.id as any);
                            reqText = `${req.amount || 0} ${component ? component.name : req.id}`;
                            isMet = compAmount >= (req.amount || 0);
                            break;
                          
                          case 'resource':
                            const resource = game.resourceManager.getResource(req.id as any);
                            const resAmount = game.resourceManager.getResourceAmount(req.id as any);
                            reqText = `${req.amount || 0} ${resource ? resource.name : req.id}`;
                            isMet = resAmount >= (req.amount || 0);
                            break;
                        }
                        
                        return (
                          <span 
                            key={`${req.type}-${req.id}`}
                            className={isMet ? 'requirement-met' : 'requirement-unmet'}
                          >
                            {index > 0 ? ', ' : ' '}
                            {reqText}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Rewards */}
                  <div className="research-rewards">
                    Rewards: 
                    {research.rewards.map((reward, index) => {
                      let rewardText = '';
                      
                      switch (reward.type) {
                        case 'resource':
                          const resource = game.resourceManager.getResource(reward.id as any);
                          const amount = alreadyCompleted ? 
                            research.getScaledReward(reward) : 
                            (reward.amount || 0);
                          
                          rewardText = `${amount} ${resource ? resource.name : reward.id}`;
                          if (alreadyCompleted) {
                            rewardText += ` (Repeatable)`;
                          }
                          break;
                        
                        case 'unlock_component':
                          const component = game.componentManager.getComponent(reward.id as any);
                          rewardText = `Unlock: ${component ? component.name : reward.id}`;
                          break;
                        
                        case 'unlock_machine':
                          const machine = game.machineManager.getMachine(reward.id as any);
                          rewardText = `Unlock: ${machine ? machine.name : reward.id}`;
                          break;
                        
                        case 'unlock_research':
                          const unlockResearch = game.researchManager.getResearch(reward.id as any);
                          rewardText = `Unlock: ${unlockResearch ? unlockResearch.name : reward.id}`;
                          break;
                      }
                      
                      return (
                        <span key={`${reward.type}-${reward.id}`}>
                          {index > 0 ? ', ' : ' '}
                          {rewardText}
                        </span>
                      );
                    })}
                  </div>
                  
                  <button
                    className="start-research-button"
                    onClick={() => handleStartResearch(research.id)}
                    disabled={!canStart}
                  >
                    {alreadyCompleted && research.repeatable ? "Research Again" : "Start Research"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Research Information */}
      <div className="research-info-section">
        <h3>About Research</h3>
        <div className="research-info">
          <p>Research is the main way to progress in the game. Some research can be repeated to gain additional rewards.</p>
          <p>Let research run in the background while you focus on other tasks!</p>
        </div>
      </div>
    </div>
  );
};