import { hash, compare } from 'bcryptjs'

import IHashProvider from './IHashProvider'

export default class BCryptHashProvider implements IHashProvider{
    public async generateHash(payload: string): Promise<string>{
        return await hash(payload, 8)
    }

    public async compareHash(payload: string, hashed: string): Promise<boolean>{
        return compare(payload, hashed)
    }
}