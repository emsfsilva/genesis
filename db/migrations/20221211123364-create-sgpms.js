'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sgpms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pg: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      matricula: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      nome: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      ome: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      status: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      nunfunc: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      localap: {
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
    await queryInterface.dropTable('sgpms');
  }
};