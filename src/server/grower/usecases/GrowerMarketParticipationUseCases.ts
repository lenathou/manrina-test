import { GrowerUseCases } from '@/server/grower/GrowerUseCases';

export class GrowerMarketParticipationUseCases {
    constructor(private growerUseCases: GrowerUseCases) {}

    public getGrowersWithNewMarketParticipations = async (sessionId: string) => {
        return this.growerUseCases.getGrowersWithNewMarketParticipations(sessionId);
    };

    public markMarketParticipationAsViewed = async (sessionId: string, growerId: string) => {
        return this.growerUseCases.markMarketParticipationAsViewed(sessionId, growerId);
    };
}