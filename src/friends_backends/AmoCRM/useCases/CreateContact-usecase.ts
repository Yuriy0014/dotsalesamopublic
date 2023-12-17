import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AmoCRMService} from "../amo.service";
import {ContactCreateDTO, ContactQueryDTO} from "../../../features/contacts/dto/contacts.dto";
import {HttpException} from "@nestjs/common";

export class CreateAmoContactCommand {
    constructor(public queryFilter: ContactQueryDTO) {
    }
}

@CommandHandler(CreateAmoContactCommand)
export class CreateAmoContactUseCase
    implements ICommandHandler<CreateAmoContactCommand> {
    constructor(private readonly amoService: AmoCRMService) {
    }

    async execute(command: CreateAmoContactCommand): Promise<string> {
        const first_name = command.queryFilter.name.split(' ')[0]
        // Если текст без пробелов сплошняком, то фамилия пустая
        const last_name = command.queryFilter.name.split(' ')[1] === undefined ? '' : command.queryFilter.name.split(' ')[1]
        const createContactDTO: ContactCreateDTO = {
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

        const result = await this.amoService.createContact(createContactDTO);

        // Проверяем, не вернулась ли ошибка
        if (result.data === null) {
            throw new HttpException(
                result.errorMessage,
                result.resultCode,
            );
        }

        // Возвращаем id созданного пользователя
        return result.data._embedded.contacts[0].id
    }
}