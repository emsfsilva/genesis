'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      email: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      password: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      image: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      loginsei: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      matricula: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      telefone: {
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
    await queryInterface.dropTable('users');
  }
};