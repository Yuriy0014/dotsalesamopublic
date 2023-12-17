import {Controller, Get, Req} from '@nestjs/common';
import {AppService} from './app.service';
import {Request} from 'express';
import {GetAmoAuthFromCodeCommand} from "./friends_backends/AmoCRM/useCases/GetAmoAuthFromCode-usecase";
import {CommandBus} from "@nestjs/cqrs";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly commandBus: CommandBus) {
    }

    @Get()
    async getHello(@Req() req: Request): Promise<string> {
        const query = req.query
        // Проверяем,что query не пустой
        if (query) {
            // Проверяем, что это запрос от нащей CRM. Число 700 просто взял большое,т.к. токен больше около 1000 знаков длиной
            if (query.referer === "dotsalesamo.amocrm.ru" && typeof (query.code) === "string" && query.code.length > 700) {
                const amo_code = query.code
                console.log(query.code)

                // Получаем access и refresh токены
                const result = await this.commandBus.execute(
                    new GetAmoAuthFromCodeCommand(amo_code),
                );

                console.log(result)


            }
        }


        return this.appService.getHello();
    }
}
