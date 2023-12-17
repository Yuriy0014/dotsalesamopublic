import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AmoCRMService} from "../amo.service";
import {HttpException} from "@nestjs/common";

export class GetAmoAuthFromRefreshTokenCommand {
    constructor() {
    }
}

@CommandHandler(GetAmoAuthFromRefreshTokenCommand)
export class GetAmoAuthFromRefreshTokenUseCase
    implements ICommandHandler<GetAmoAuthFromRefreshTokenCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(): Promise<any> {
        const result = await this.amoService.getAccessTokenFromRefresh();
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage!,
                result.resultCode,
            );
        }
        return result.data
    }
}