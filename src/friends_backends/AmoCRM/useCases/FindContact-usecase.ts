import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AmoCRMService} from "../amo.service";
import {ContactQueryDTO} from "../../../features/contacts/dto/contacts.dto";
import {HttpException} from "@nestjs/common";

export class GetAmoContactCommand {
    constructor(public query: ContactQueryDTO) {
    }
}

@CommandHandler(GetAmoContactCommand)
export class GetAmoContactUseCase
    implements ICommandHandler<GetAmoContactCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(command: GetAmoContactCommand): Promise<string[]> {
        const result = await this.amoService.getContactsIds(command.query.phone, command.query.email);
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage!,
                result.resultCode,
            );
        }
        return result.data
    }
}