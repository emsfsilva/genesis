'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diariasgercota', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      ttexe: {
        type: Sequelize.INTEGER
      },

      mes: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },

      ano: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },

      obs: {
        type: Sequelize.STRING(200),
        collate: 'utf8mb4_general_ci'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diariasgercota');
  }
};