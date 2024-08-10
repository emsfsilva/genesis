'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diarias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      evento: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      operacao: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      
      cotadist: {
        type: Sequelize.INTEGER 
      },

      obs: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },

      sei: {
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
    await queryInterface.dropTable('diarias');
  }
};