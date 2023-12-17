class ContactID {
    id: number;
}

class LeadEmbedded {
    contacts: ContactID[];
}

export class CreatLeadDTO {
    name: string;
    price: number;
    status_id: number;
    _embedded: LeadEmbedded;
}
