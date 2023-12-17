import {CanActivate, Injectable, UnauthorizedException} from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import * as process from "process";
import {CommandBus} from "@nestjs/cqrs";
import {
    GetAmoAuthFromRefreshTokenCommand
} from "../../../friends_backends/AmoCRM/useCases/GetAmoAuthFromRefreshToken-usecase";

@Injectable()
export class VerifyAccessTokenGuard implements CanActivate {
    constructor(private readonly commandBus: CommandBus) {
    }

    async canActivate(): Promise<boolean> {
        const access_token = process.env.ACCESS_TOKEN

        if (!access_token) {
            throw new UnauthorizedException([
                {message: 'access_token пустой. Получи первоначальную пару из CRM', field: 'access_token'},
            ]);
        }

        const decoded = jwt.decode(access_token);

        if(typeof(decoded) === "string") {
            throw new UnauthorizedException("Что то пошло не так с токеном, попробуй еще раз")
        }

        if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
            console.log('Токен истек');
            console.log('Получаем новый');
            await this.commandBus.execute(
                new GetAmoAuthFromRefreshTokenCommand(),
            );
            console.log('Новые токены получены. Ура разработчикам :)');
            return true;


        } else {
            console.log('Токен действителен или не содержит информации об истечении');
            return true;
        }

    }
}