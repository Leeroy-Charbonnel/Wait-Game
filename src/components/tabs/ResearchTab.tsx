import React from 'react';
import { Game } from '../../game/Game';

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
  const handleStartResearch = (researchId: string) => {
    const success = game.researchManager.startResearch(researchId as any);
    
    if (!success) {
      alert('Cannot start research. Check requirements.');
    }
  };
  
  const handleCancelResearch = () => {
    game.researchManager.cancelResearch();
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
                    <div>{research.name}</div>
                    <div>{research.description}</div>
                  </>
                );
              })()}
            </>
          ) : (
            <div>No active research</div>
          )}
        </div>
        
        {activeResearch.id && (
          <>
            <div className="research-progress-container">
              <div 
                className="research-progress-bar"
                style={{ width: `${getResearchProgress()}%` }}
              ></div>
              <div className="research-progress-text">
                {`${Math.round(getResearchProgress())}% - ${getRemainingTime()} remaining`}
              </div>
            </div>
            
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
        )}
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
              
              return (
                <div className="research-item" key={research.id}>
                  <div className="research-name">{research.name}</div>
                  <div className="research-description">{research.description}</div>
                  <div className="research-time">Time: {research.getFormattedDuration()}</div>
                  
                  {/* Requirements */}
                  {research.requirements.length > 0 && (
                    <div className="research-requirements">
                      Requirements: 
                      {research.requirements.map((req, index) => {
                        let reqText = '';
                        
                        switch (req.type) {
                          case 'research':
                            const reqResearch = game.researchManager.getResearch(req.id as any);
                            reqText = reqResearch ? reqResearch.name : req.id;
                            break;
                          
                          case 'component':
                            const component = game.componentManager.getComponent(req.id as any);
                            reqText = `${req.amount || 0} ${component ? component.name : req.id}`;
                            break;
                          
                          case 'resource':
                            const resource = game.resourceManager.getResource(req.id as any);
                            reqText = `${req.amount || 0} ${resource ? resource.name : req.id}`;
                            break;
                        }
                        
                        return (
                          <span key={`${req.type}-${req.id}`}>
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
                          rewardText = `${reward.amount || 0} ${resource ? resource.name : reward.id}`;
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
                    disabled={!canStart || activeResearch.id !== null}
                  >
                    Start Research
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};