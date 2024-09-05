'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diariatela', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      valorliberado: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      ttcotaconsumida: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      ttsaldo: {
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
      }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diariatela');
  }
};