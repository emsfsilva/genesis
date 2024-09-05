'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escalas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operacao: {
        type: Sequelize.STRING(50),
        collate: 'utf8mb4_general_ci'
      },
      cod: {
        type: Sequelize.INTEGER
      },
      nunfunc: {
        type: Sequelize.INTEGER
      },
      nunvinc: {
        type: Sequelize.INTEGER
      },
      pg: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      matricula: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      nome: {
        type: Sequelize.STRING(50),
        collate: 'utf8mb4_general_ci'
      },
      telefone: {
        type: Sequelize.STRING(20),
        collate: 'utf8mb4_general_ci'
      },
      status: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      modalidade: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      data_inicio: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      hora_inicio: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      data_fim: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      hora_fim: {
        type: Sequelize.STRING,
        collate: 'utf8mb4_general_ci'
      },
      ome_sgpm: {
        type: Sequelize.STRING(11),
        collate: 'utf8mb4_general_ci'
      },
      localap: {
        type: Sequelize.STRING(200),
        collate: 'utf8mb4_general_ci'
      },
      ttcota: {
        type: Sequelize.INTEGER
      },
      anotacoes: {
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
    await queryInterface.dropTable('escalas');
  }
};
