'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tetopjes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ctgeralinicialof: {
        type: Sequelize.INTEGER
      },
      ctgeralinicialprc: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('tetopjes');
  }
};