import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AmoCRMService} from "../amo.service";
import {HttpException} from "@nestjs/common";

export class GetAmoAuthFromCodeCommand {
    constructor(public authCode: string) {
    }
}

@CommandHandler(GetAmoAuthFromCodeCommand)
export class GetAmoAuthFromCodeUseCase
    implements ICommandHandler<GetAmoAuthFromCodeCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(command: GetAmoAuthFromCodeCommand): Promise<any> {
        const result = await this.amoService.getAccessTokenFromCode(command.authCode);
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage!,
                result.resultCode,
            );
        }
        return result.data
    }
}