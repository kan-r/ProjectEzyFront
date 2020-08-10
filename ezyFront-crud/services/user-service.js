/**
 * this is just for demonstration purpose
 * this can be changed to interact with a database via REST API or by other means
 */
class UserService {

    constructor(){
        this.data = [
            {
                userId: 'ADMIN',
		        pword: 'admin',
                firstName: 'Admin',
                lastName: '',
                active: true,
                dateCrt: '2020-05-09T16:30',
                userCrt: '',
                dateMod: '',
                userMod: null,
                userCrtObj: {},
                userModObj: {}
            },
            {
                userId: 'KAN',
		        pword: 'kan',
                firstName: 'Kan',
                lastName: 'Ranganathan',
                active: true,
                dateCrt: '2020-05-09T16:30',
                userCrt: 'ADMIN',
                dateMod: '',
                userMod: null,
                userCrtObj: {userId: 'ADMIN', firstName: 'Admin', lastName: ''},
                userModObj: {}
            }
        ]
    }

    //private
    _getUser(userId){
        let users = this.data.filter(
            user => user.userId === userId
        )

        if(users.length === 0){
            return null;
        }

        return users[0];
    }

    getUserList(){
        return Promise.resolve(this.data);
    }

    getUser(userId){
        const user = this._getUser(userId);

        if(user === null){
            return Promise.reject(`User with userId: ${userId} does not exist`);
        }

        return Promise.resolve(user);
    }

    addUser(user){
        //validation
        if(user.userId === ''){
            return Promise.reject(`User ID is required`);
        }

        //validation
        if(user.pword === ''){
            return Promise.reject(`Password is required`);
        }

        const usr = this._getUser(user.userId);

        if(usr !== null){
            return Promise.reject(`User with userId: ${user.userId} already exists`);
        }

        user.dateCrt = new Date();
        user.userCrtObj = this._getUser(user.userCrt);
        this.data.push(user);
        return Promise.resolve(user);
    }

    updateUser(user){
        //validation
        if(user.pword === ''){
            return Promise.reject(`Password is required`);
        }

        const usr = this._getUser(user.userId);

        if(usr === null){
            return Promise.reject(`User with userId: ${user.userId} does not exist`);
        }

        user.dateMod = new Date();
        user.userModObj = this._getUser(user.userMod);

        // find and update
        for(let i = this.data.length-1; i >= 0; i--){
            if(this.data[i].userId === user.userId){
                this.data[i] = user;
                return Promise.resolve(user);
            }
        }
    }

    deleteUser(userId){
        const user = this._getUser(userId);

        if(user === null){
            return Promise.reject(`User with userId: ${userId} does not exist`);
        }

        //find and delete
        for(let i = this.data.length-1; i >= 0; i--){
            if(this.data[i].userId === userId){
                const user = this.data[i];
                this.data.splice(i, 1);
                return Promise.resolve(user);
            }
        }
    }
}

export let userService = new UserService();
