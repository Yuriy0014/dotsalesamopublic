import {HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from "rxjs";
import * as process from 'process';
import {ContactCreateDTO, ContactUpdateDTO} from "../../features/contacts/dto/contacts.dto";
import {CreatLeadDTO} from "./dto/deals.dto";
import {Result} from "../../response_type";
import {tokens} from "./types/auth.types";


@Injectable()
export class AmoCRMService {
    constructor(private httpService: HttpService) {
    }


    /////////////////////////////////////////////
    ///////// Получение авторизационных токенов
    ////////////////////////////////////////////

    async getAccessTokenFromCode(authCode: string): Promise<Result<tokens>> {
        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url = `https://${subdomain}.amocrm.ru/oauth2/access_token`; // URL для запроса

        const data = {
            "client_id": process.env.CLIENT_ID,
            "client_secret": process.env.CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": authCode,
            "redirect_uri": process.env.REDIRECT_URL
        };

        try {
            const response = await firstValueFrom(this.httpService.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response.status !== 200 && response.status !== 204) {
                return {
                    resultCode: response.status,
                    data: null,
                    errorMessage: 'Возникла ошибка при получении токенов. Неожиданный код ответа сервера',
                }
            }

            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            // дальнейшая обработка токенов

            // Обновляем токены в
            global['ACCESS_TOKEN_GLOBAL'] = accessToken;
            global['REFRESH_TOKEN_GLOBAL'] = refreshToken;

            return {
                resultCode: HttpStatus.OK,
                data: {"accessToken": accessToken, "refreshToken": refreshToken}
            }

        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Возникла ошибка при получении токенов"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg
            };
        }
    }

    async getAccessTokenFromRefresh(): Promise<Result<tokens>> {
        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url = `https://${subdomain}.amocrm.ru/oauth2/access_token`; // URL для запроса
        const ref_token = global['REFRESH_TOKEN_GLOBAL']
        const data = {
            "client_id": process.env.CLIENT_ID,
            "client_secret": process.env.CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": ref_token,
            "redirect_uri": process.env.REDIRECT_URL
        };

        try {
            const response = await firstValueFrom(this.httpService.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response.status !== 200 && response.status !== 204) {
                return {
                    resultCode: response.status,
                    data: null,
                    errorMessage: 'Возникла ошибка при получении токенов. Неожиданный код ответа сервера',
                }
            }

            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            // дальнейшая обработка токенов

            global['ACCESS_TOKEN_GLOBAL'] = accessToken;
            global['REFRESH_TOKEN_GLOBAL'] = refreshToken;

            return {
                resultCode: HttpStatus.OK,
                data: {"accessToken": accessToken, "refreshToken": refreshToken}
            }

        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Возникла ошибка при получении токенов"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg
            };
        }
    }


    /////////////////////////////////////////////
    ///////// Получаем id контактов
    ////////////////////////////////////////////
    async getContactsIds(phone: string, email: string): Promise<Result<string[]>> {
        let contacts_with_phone = []
        let contacts_with_email = []

        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url_with_phone = `https://${subdomain}.amocrm.ru/api/v4/contacts?query=${phone}`; // URL для запроса
        const url_with_email = `https://${subdomain}.amocrm.ru/api/v4/contacts?query=${email}`; // URL для запроса
        const acc_token = global['ACCESS_TOKEN_GLOBAL']
        const authHeader = `Bearer ${acc_token}`

        // Найдем контакты по телефону
        try {
            const response_with_phone = await firstValueFrom(this.httpService.get(url_with_phone, {
                headers: {
                    'Authorization': authHeader,
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response_with_phone.status != 200 && response_with_phone.status !== 204) {
                return {
                    resultCode: response_with_phone.status,
                    data: null,
                    errorMessage: 'Во время поиска контактов по телефону возникла непредвиденная ошибка(Неожиданный код ответа сервера), попробуйте еще раз',
                }
            }

            if (response_with_phone.status != 204) {
                contacts_with_phone = response_with_phone.data._embedded.contacts.map(item => item.id);
            }
        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Во время поиска контактов по телефону возникла непредвиденная ошибка"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg,
            };
        }


        // Найдем контакты по email
        try {
            const response_with_email = await firstValueFrom(this.httpService.get(url_with_email, {
                headers: {
                    'Authorization': authHeader,
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response_with_email.status != 200 && response_with_email.status != 204) {
                return {
                    resultCode: response_with_email.status,
                    data: null,
                    errorMessage: 'Во время поиска контактов по email возникла непредвиденная ошибка(Неожиданный код ответа сервера), попробуйте еще раз',
                }
            }

            if (response_with_email.status != 204) {
                contacts_with_email = response_with_email.data._embedded.contacts.map(item => item.id);
            }

        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Во время поиска контактов по email возникла непредвиденная ошибка"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg,
            };
        }


        // Делаем через SET т.к. может быть ситуация, когда по номеру и по почте найдется один и тот же пользователь,
        //  и если просто слить два массива в 1 - будет дубль
        return {
            resultCode: HttpStatus.OK,
            data: [...new Set([...contacts_with_phone, ...contacts_with_email])]
        }


    }

    /////////////////////////////////////////////
    /////////  Создаем новый контакт
    ////////////////////////////////////////////
    async createContact(createContactDTO: ContactCreateDTO): Promise<Result<any>> {
        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url = `https://${subdomain}.amocrm.ru/api/v4/contacts`; // URL для запроса
        const acc_token = global['ACCESS_TOKEN_GLOBAL']
        const authHeader = `Bearer ${acc_token}`
        const data = [createContactDTO];

        try {
            const response = await firstValueFrom(this.httpService.post(url, data, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response.status == 200 || response.status == 204) {
                return {
                    resultCode: response.status,
                    data: response.data
                }
            }


            return {
                resultCode: response.status,
                data: null,
                errorMessage: 'Во время создания контакта возникла непредвиденная ошибка(Неожиданный код ответа сервера)',
            };


        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Во время создания контакта возникла непредвиденная ошибка"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg,
            };
        }
    }

    /////////////////////////////////////////////
    /////////  Обновляем существующий контакт
    ////////////////////////////////////////////
    async updateContact(updateContactDTO: ContactUpdateDTO): Promise<Result<boolean>> {
        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url = `https://${subdomain}.amocrm.ru/api/v4/contacts`; // URL для запроса
        const acc_token = global['ACCESS_TOKEN_GLOBAL']
        const authHeader = `Bearer ${acc_token}`
        const data = [updateContactDTO];

        try {
            const response = await firstValueFrom(this.httpService.patch(url, data, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response.status == 200 || response.status == 204) {
                return {
                    resultCode: response.status,
                    data: true
                }
            }

            return {
                resultCode: response.status,
                data: null,
                errorMessage: `Статус ответа сервера при попытке обновить контакт ${updateContactDTO.id} контакт = ${response.status}`,
            };


        } catch (error) {
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Во время обновления контакта возникла непредвиденная ошибка"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg,
            };
        }
    }

    /////////////////////////////////////////////
    /////////  Создаем сделку
    ////////////////////////////////////////////
    async createLead(createLeadDTO: CreatLeadDTO): Promise<Result<boolean>> {
        const subdomain = process.env.SUBDOMAIN; // Поддомен нужного аккаунта
        const url = `https://${subdomain}.amocrm.ru/api/v4/leads`; // URL для запроса
        const acc_token = global['ACCESS_TOKEN_GLOBAL']
        const authHeader = `Bearer ${acc_token}`
        const data = [createLeadDTO];

        try {
            const response = await firstValueFrom(this.httpService.post(url, data, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'User-Agent': 'amoCRM-oAuth-client/1.0',
                },
            }));

            if (response.status == 200 || response.status == 204) {
                return {
                    resultCode: response.status,
                    data: true
                }
            }

            return {
                resultCode: response.status,
                data: null,
                errorMessage: `Статус ответа сервера при попытке создать сделку = ${response.status}`,
            };


        } catch (error) {
            console.log(error)
            const resCode = typeof (error.response.status) === "number" ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR
            const resMsg = error.response.status === 401 ? "Отказано в доступе" : "Во время создания сделки возникла непредвиденная ошибка"
            return {
                resultCode: resCode,
                data: null,
                errorMessage: resMsg,
            };
        }
    }
}
