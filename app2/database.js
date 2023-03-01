import Sequelize from 'sequelize'

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
})

const Users = sequelize.define('user', {
    id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    characterName: Sequelize.TEXT,
    avatarUrl: Sequelize.STRING,
    delimiter: Sequelize.STRING,
    greedy: Sequelize.BOOLEAN,
})

await Users.sync({ alter: true });

export {
    Users,
}
