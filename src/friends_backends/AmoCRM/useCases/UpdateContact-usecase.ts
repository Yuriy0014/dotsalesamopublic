import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AmoCRMService} from "../amo.service";
import {ContactQueryDTO, ContactUpdateDTO} from "../../../features/contacts/dto/contacts.dto";
import {HttpException} from "@nestjs/common";

export class UpdateAmoContactCommand {
    constructor(public contactId: number, public queryFilter: ContactQueryDTO) {
    }
}

@CommandHandler(UpdateAmoContactCommand)
export class UpdateAmoContactUseCase
    implements ICommandHandler<UpdateAmoContactCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(command: UpdateAmoContactCommand): Promise<void> {
        const first_name = command.queryFilter.name.split(' ')[0]
        // Если текст без пробелов сплошняком, то фамилия пустая
        const last_name = command.queryFilter.name.split(' ')[1] === undefined ? '' : command.queryFilter.name.split(' ')[1]
        const updateContactDTO: ContactUpdateDTO = {
            "id": command.contactId,
            "first_name": first_name,
            "last_name": last_name,
            "custom_fields_values": [
                {
                    "field_id": 611465,
                    "values": [
                        {
                            "value": command.queryFilter.phone
                        }
                    ]
                },
                {
                    "field_id": 611467,
                    "values": [
                        {
                            "value": command.queryFilter.email
                        }
                    ]
                }
            ]
        }

        const result = await this.amoService.updateContact(updateContactDTO);

        // Проверяем не вернулась ли ошибка
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage!,
                result.resultCode,
            );
        }
    }
}