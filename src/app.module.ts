import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ContactsController} from "./features/contacts/contacts.controller";
import {AmoCRMService} from "./friends_backends/AmoCRM/amo.service";
import {HttpModule} from "@nestjs/axios";
import {CqrsModule} from "@nestjs/cqrs";
import {GetAmoAuthFromCodeUseCase} from "./friends_backends/AmoCRM/useCases/GetAmoAuthFromCode-usecase";
import {ConfigModule} from "@nestjs/config";
import {GetAmoContactUseCase} from "./friends_backends/AmoCRM/useCases/FindContact-usecase";
import {CreateAmoContactUseCase} from "./friends_backends/AmoCRM/useCases/CreateContact-usecase";
import {UpdateAmoContactUseCase} from "./friends_backends/AmoCRM/useCases/UpdateContact-usecase";
import {CreateAmoLeadUseCase} from "./features/deals/use-cases/CreateLead-usecase";
import {GetAmoAuthFromRefreshTokenUseCase} from "./friends_backends/AmoCRM/useCases/GetAmoAuthFromRefreshToken-usecase";

@Module({
    // ConfigModule.forRoot() - чтобы использовать .env
    // HttpModule - для axios
    // CqrsModule - для использования CommandBus чтобы уменьшить количесво импортов в конструктор
    imports: [ConfigModule.forRoot(), HttpModule, CqrsModule],
    controllers: [AppController, ContactsController],
    providers: [AppService,
        AmoCRMService,
        GetAmoAuthFromCodeUseCase,
        GetAmoContactUseCase,
        CreateAmoContactUseCase,
        UpdateAmoContactUseCase,
        CreateAmoLeadUseCase,
        GetAmoAuthFromRefreshTokenUseCase],
})
export class AppModule {
}
