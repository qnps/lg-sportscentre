export interface Team {
    id: number;
    name: string;
    shortName: string;
}

export interface TeamList {
    [index: number]: Team;
}