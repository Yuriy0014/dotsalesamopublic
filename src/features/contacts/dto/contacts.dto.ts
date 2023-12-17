import {IsEmail, IsNotEmpty, IsString, Length, Matches} from "class-validator";

// DTO для типизации и валидации входящих query параметров
export class ContactQueryDTO {
    @IsString()
    @Length(7, 50, {message: 'Длина имени можетсодержать от 7 до 50 символов'})
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(3, 30,{message: 'Почтовый адрес должен содержать от 3 до 11 символов'})
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'Почта не должна содержать пробелов',
    })
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(11, 11, {message: 'Номер должен содержать 11 цифр'})
    // Проверяем, что номер начинается с 7 или 8
    @Matches(/^7|^8/, {
        message: 'Номер должен начинаться с 7 или 8',
    })
    @Matches(/.*\S+.*/, {
        message: 'Номер не должен содержать пробелов',
    })
    phone: string;
}

// DTO для типизации объекта для создания контакта
export class CustomFieldValue {
    value: string;
}

export class CustomField {
    field_id: number;
    values: CustomFieldValue[];
}

export class ContactCreateDTO {
    first_name: string;
    last_name: string;
    custom_fields_values: CustomField[];
}

export class ContactUpdateDTO {
    id: number;
    first_name: string;
    last_name: string;
    custom_fields_values: CustomField[];
}