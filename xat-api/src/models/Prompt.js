const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Conversation = require('./Conversation');

const Prompt = sequelize.define('Prompt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    model: {
        type: DataTypes.STRING,
        defaultValue: "qwen2.5-coder",
        allowNull: false
    },
    stream: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Establir relació
Prompt.belongsTo(Conversation);
Conversation.hasMany(Prompt);

module.exports = Prompt;