interface Timestamp {
    createAt: Date
    updatedAt: Date
}

export interface User extends Timestamp {
    id: number
    first_name: string
    last_name: string
    full_name: string
    email: string
    uuid: string
}
