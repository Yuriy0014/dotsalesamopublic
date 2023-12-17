import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {HttpException} from "@nestjs/common";
import {CreatLeadDTO} from "../../../friends_backends/AmoCRM/dto/deals.dto";
import {AmoCRMService} from "../../../friends_backends/AmoCRM/amo.service";

export class CreateAmoLeadCommand {
    constructor(public userId: number) {
    }
}

@CommandHandler(CreateAmoLeadCommand)
export class CreateAmoLeadUseCase
    implements ICommandHandler<CreateAmoLeadCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(command: CreateAmoLeadCommand): Promise<void> {
        // id означающее, что сделка будет в статусе Первичный контакт (первый статус воронки)
        const first_deal_status = 62805462

        const creatLeadDTO: CreatLeadDTO = {
            "name": `Тестовая сделка для юзера с id=${command.userId}`,
            "price": 48000,
            "status_id": first_deal_status,
            "_embedded": {
                "contacts": [
                    {
                        "id": command.userId
                    }
                ]
            }
        }

        const result = await this.amoService.createLead(creatLeadDTO);

        // Проверяем не вернулась ли ошибка
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage!,
                result.resultCode,
            );
        }
    }
}