class Users{
    constructor(){
        this.users = [];
    }

    /* FUNCTION FOR ADDING USER */
    addUser(id,name,room){
        var user = {id,name,room};
        this.users.push(user);
        return user;
    }
    /* FUNCTION FOR REMOVING USER */
    removeUser(id){
        var user = this.getUser(id);
        if(user){
            this.users = this.users.filter((user)=> user.id!==id);   /* USER LIST WILL BE UPDATED */
        }

        return user;
    }
    /* FUNCTION FOR FINDING USER */
    getUser(id){
        return this.users.filter((user)=> user.id === id)[0];      /* FINDING AND RETURNING THE USER WITH SAME ID AND RETURNING IT WHICH WILL BE AT INDEX 0 */
    }

    /* FUNCTION RETURNING LIST OF USER IN SAME ROOM */
    getUserList(room){
        var users = this.users.filter((user)=> user.room === room);        /* FINDING USER WITH SAME ROOM NAME */
        var namesArray = users.map((user)=> user.name);                    /* SELECTING USER NAMES IN THAT ROOM */

        return namesArray;
    }
}

module.exports = {Users}