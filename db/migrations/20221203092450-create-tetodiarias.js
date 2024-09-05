'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tetodiarias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ctgeralinicial: {
        type: Sequelize.INTEGER
      },
      mes: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      ano: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tetodiarias');
  }
};