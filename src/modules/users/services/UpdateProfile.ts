import { injectable, inject } from 'tsyringe'

import AppError from '@shared/errors/AppError'
import IUsersRepository from '../interfaces/IUserRepository'
import IHashProvider from '../providers/hash/IHashProvider'

import User from '../infra/typeorm/entities/user'

interface IRequest {
    user_id: string,
    name: string,
    email: string,
    old_password?:string
    password?: string
}

@injectable()
export default class UpdateProfile {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('HashProvider')
        private hashProvider: IHashProvider
    ){}

    public async execute({ user_id, name, email, password, old_password }: IRequest):Promise<User>{
        const user = await this.usersRepository.findById(user_id)

        if(!user){
            throw new AppError('User does not exists')
        }

        const userWithTheEmail = await this.usersRepository.findByEmail(email)

        if(userWithTheEmail && userWithTheEmail.id !== user_id){
            throw new AppError('Email already used')
        }

        user.name = name
        user.email = email

        if(password && !old_password){
            throw new AppError('You need to innform the old password to set another one.')
        }

        if(password && old_password){
            const checkOldPassword = await this.hashProvider.compareHash(
                old_password,
                user.password
            )

            if(!checkOldPassword){
                throw new AppError('Wrong old password.')
            }

            user.password = await this.hashProvider.generateHash(password)
        }
        
        await this.usersRepository.save(user)

        return user
    }
}