export interface IdentificationDetails {
    [key: string]: string;
}

export interface IdentificationResultType {
    name: string;
    description: string;
    hyperlinkValue: string;
    details: IdentificationDetails;
}
