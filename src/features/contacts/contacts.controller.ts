import {Controller, Get, HttpException, HttpStatus, Query, UseGuards,} from '@nestjs/common';
import {ContactQueryDTO} from "./dto/contacts.dto";
import {CommandBus} from "@nestjs/cqrs";
import {GetAmoContactCommand} from "../../friends_backends/AmoCRM/useCases/FindContact-usecase";
import {CreateAmoContactCommand} from "../../friends_backends/AmoCRM/useCases/CreateContact-usecase";
import {UpdateAmoContactCommand} from "../../friends_backends/AmoCRM/useCases/UpdateContact-usecase";
import {CreateAmoLeadCommand} from "../deals/use-cases/CreateLead-usecase";
import {VerifyAccessTokenGuard} from "./guards/auth.guard";


@Controller('contacts')
export class ContactsController {
    constructor(private readonly commandBus: CommandBus) {
    }


    @Get()
    @UseGuards(VerifyAccessTokenGuard)
    async processContact(
        @Query()
            query: ContactQueryDTO,
    ): Promise<any> {
        const queryFilter: ContactQueryDTO = query;
        let contactsIds = await this.commandBus.execute(
            new GetAmoContactCommand(queryFilter),
        );


        console.log("Массив найденных id контактов")
        console.log(contactsIds)

        // Если массив ID содержит более 1 значения - значит контакты задублировались, сообщаем пользователю, чтобы сначала определил, какой из контактов верный
        if (contactsIds.length > 1) {
            throw new HttpException("Найдено больше 1 контакта, соответствующих данным. Пожалуйста, удалите задубленный контакт", HttpStatus.BAD_REQUEST)
        }

        // Если контакт нашелся - обновляем
        if (contactsIds.length === 1) {
            // Обновляем найденный контакт
            await this.commandBus.execute(
                new UpdateAmoContactCommand(+contactsIds[0], queryFilter),
            );
        }

        // Если массив ID вернулся пустой, значит не нашлось контакта и нужно его создать
        if (contactsIds.length === 0) {
            const createdContactId = await this.commandBus.execute(
                new CreateAmoContactCommand(queryFilter),
            );

            contactsIds = [createdContactId]
        }


        // Создаем сделку
        await this.commandBus.execute(
            new CreateAmoLeadCommand(+contactsIds[0]),
        );
    }
}