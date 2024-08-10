'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pjesgercota', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      operacao: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      ttofexe: {
        type: Sequelize.INTEGER
      },

      ttprcexe: {
        type: Sequelize.INTEGER
      },

      status: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      mes: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      ano: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      obs: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('pjesgercota');
  }
};