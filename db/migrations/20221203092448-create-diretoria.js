'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diretorias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diretorias');
  }
};