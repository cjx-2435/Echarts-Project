import request from './config'
import {HttpResponse} from '@/types'

export class MapService{
    static async getData():Promise<HttpResponse>{
        return request('/json/china.json',{
            method:'GET',
        })
    }
}

export class TestService{
    static async request(url:string):Promise<HttpResponse>{
        return request(url,{
            method:'GET',
        })
    }
}