const Sequelize = require("sequelize");
var s = require("../connectors/postgres");
const User = require("./user");
const Group = require("./group");
const Project = require("./project");

const Task = s.define(
    "task",
    {
        title: {
            // task title
            type: Sequelize.STRING,
            allowNull: false,
        },
        date: {
            // date
            type: Sequelize.DATE,
            allowNull: true,
        },
        finished: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

Task.belongsTo(User, {
    foreignKey: { name: "user_id", allowNull: true },
    onDelete: "CASCADE",
});

Task.belongsTo(Project, {
    foreignKey: { name: "project_id", allowNull: true },
    onDelete: "CASCADE",
});

Task.belongsTo(Group, {
    foreignKey: { name: "group_id", allowNull: true },
    onDelete: "CASCADE",
});

Task.sync();

module.exports = Task;