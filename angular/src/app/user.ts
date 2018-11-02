export class User {
  id: number
  email: string
  password: string
  name: string
  signed_in: boolean

    constructor(id: number, email: string, password: string, name: string, signed_in: boolean) {
        this.id = id
        this.email = email
        this.password = password
        this.name = name
        this.signed_in = signed_in
    }


}
