const Sequelize = require("sequelize");
const Task = require("../models/task");
const redis = require("../connectors/redis");
const Op = Sequelize.Op;

const getTask = async (req, res) => {
    try {
        const { task_id } = req.body;
        const task = await Task.findOne({ where: { id: task_id } });
        if (task) {
            res.status(200).json(task);
        } else {
            res.status(404).json("task not found");
        }
    } catch (error) {
        console.error(error);
    }
};

const getAllTasks = async (req, res) => {
    try {
        const cacheKey = `user_tasks_${req.user.user_id}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
        } else {
            const tasks = await Task.findAll({
                where: {
                    [Op.or]: [
                        { user_id: req.user.user_id },
                        { creator_id: req.user.user_id },
                    ],
                },
            });
            if (tasks) {
                await redis.saveWithTtl(cacheKey, tasks, 300);
                res.status(200).json(tasks);
            } else {
                res.status(404).json("tasks not found");
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            status,
            project_id,
            creator_id,
            user_id,
        } = req.body;
        const cacheKey = `user_tasks_${req.user.user_id}`;
        if (!(project_id && user_id)) {
            var task = new Task({
                title,
                description,
                date,
                status,
                project_id,
                creator_id: req.user.user_id,
                user_id: creator_id,
            });
        } else {
            var task = new Task({
                title,
                description,
                date,
                status,
                project_id,
                creator_id: req.user.user_id,
                user_id,
            });
        }

        await task.save();
        await redis.del(cacheKey);
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
    }
};

const updateTask = async (req, res) => {
    try {
        const { id, title, status, project_id, creator_id, user_id } = req.body;
        const task = await Task.findOne({
            where: {
                id: id,
                [Op.or]: [
                    { user_id: req.user.user_id },
                    { creator_id: req.user.user_id },
                ],
            },
        });
        if (task) {
            var updatedtask = await Task.update(
                { title, status, project_id, creator_id, user_id },
                { where: { id } }
            );

            res.status(200).json(updatedtask);
        } else {
            res.status(404).json("task not found");
        }
    } catch (error) {
        console.error(error);
    }
};

const removeTask = async (req, res) => {
    try {
        const { task_id } = req.body;
        const cacheKey = `user_tasks_${req.user.user_id}`;
        const task = await Task.findOne({
            where: { id: task_id, user_id: req.user.user_id },
        });
        if (task) {
            await Task.destroy({ where: { id: task_id } });
            await redis.del(cacheKey);
            res.status(200).json("task removed successfully");
        } else {
            res.status(404).json("task not found");
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    getTask,
    getAllTasks,
    createTask,
    updateTask,
    removeTask,
};
