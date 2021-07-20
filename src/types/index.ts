export interface Todo {
    id: number;
    content: string;
    checked: boolean;
}

export interface HttpResponse {
    status: number
    statusText: string
    data: {
        code: number
        desc: string
        [key: string]: any
    }
}